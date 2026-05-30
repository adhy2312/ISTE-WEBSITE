# compliance_scraper.py
import asyncio
import socket
import ipaddress
import urllib.robotparser
from urllib.parse import urlparse
import aiohttp
import logging

logger = logging.getLogger(__name__)

class SecurityException(Exception):
    pass

def verify_dns_safety(url: str) -> str:
    """
    Resolves domain IP addresses and blocks internal subnets to prevent SSRF attacks.
    """
    parsed = urlparse(url)
    hostname = parsed.hostname
    if not hostname:
        raise SecurityException("Invalid URL: Missing hostname")
    
    try:
        ip_address = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip_address)
        
        if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local:
            raise SecurityException(f"SSRF block: Domain {hostname} resolves to private IP {ip_address}")
        
        # Explicit block for cloud metadata service loopback
        if ip_address == "169.254.169.254":
            raise SecurityException("SSRF block: Attempted to access cloud metadata IP")
            
        return ip_address
    except socket.gaierror as e:
        raise SecurityException(f"DNS resolution failed for {hostname}: {e}")

class AsyncRobotParser:
    def __init__(self, user_agent: str = "ISTE-InternshipLaunchpadBot/12.1"):
        self.user_agent = user_agent
        self.parsers: dict[str, urllib.robotparser.RobotFileParser] = {}

    async def check_compliance(self, url: str) -> bool:
        parsed = urlparse(url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        robots_url = f"{base_url}/robots.txt"
        
        if base_url not in self.parsers:
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(robots_url)
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(robots_url, timeout=5) as resp:
                        if resp.status == 200:
                            content = await resp.text()
                            rp.parse(content.splitlines())
            except Exception as e:
                logger.warning(f"Failed to fetch robots.txt for {base_url}: {e}")
            self.parsers[base_url] = rp
            
        rp = self.parsers[base_url]
        return rp.can_fetch(self.user_agent, url)

class AsyncScraper:
    def __init__(self, max_concurrent: int = 20):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.robot_parser = AsyncRobotParser()
        self.timeout = aiohttp.ClientTimeout(total=15)
        self.connector = aiohttp.TCPConnector(limit=max_concurrent, ttl_dns_cache=300)
        self.session: aiohttp.ClientSession | None = None
        self.user_agent = "ISTE-InternshipLaunchpadBot/12.1"

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            connector=self.connector,
            timeout=self.timeout,
            headers={"User-Agent": self.user_agent}
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def fetch(self, url: str) -> str | None:
        try:
            verify_dns_safety(url)
            
            is_allowed = await self.robot_parser.check_compliance(url)
            if not is_allowed:
                logger.warning(f"Compliance block: Robots.txt restricted access to {url}")
                return None
                
            async with self.semaphore:
                if not self.session:
                    raise RuntimeError("AsyncScraper session not initialized")
                    
                async with self.session.get(url) as response:
                    if response.status == 200:
                        return await response.text()
                    else:
                        logger.warning(f"HTTP {response.status} returned for {url}")
                        return None
        except SecurityException as se:
            logger.error(f"Security violation for {url}: {se}")
            return None
        except asyncio.TimeoutError:
            logger.error(f"Timeout fetching {url} exceeded 15 seconds")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching {url}: {e}")
            return None
