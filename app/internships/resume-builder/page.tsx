'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ArrowLeft, Plus, Trash2, Download } from 'lucide-react';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  technologies: string;
  date: string;
  description: string;
}

interface SkillCategory {
  id: string;
  category: string;
  skills: string;
}

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'experience' | 'projects' | 'skills'>('personal');
  const [isExporting, setIsExporting] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const [personal, setPersonal] = useState<PersonalInfo>({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    portfolio: 'johndoe.dev'
  });

  const [education, setEducation] = useState<Education[]>([
    {
      id: '1',
      institution: 'Mar Baselios College of Engineering and Technology',
      degree: 'B.Tech in Computer Science and Engineering',
      location: 'Trivandrum, KL',
      startDate: 'Aug 2022',
      endDate: 'Present',
      gpa: '8.5 CGPA'
    }
  ]);

  const [experience, setExperience] = useState<Experience[]>([
    {
      id: '1',
      company: 'Tech Innovations Inc.',
      role: 'Software Engineering Intern',
      location: 'Remote',
      startDate: 'May 2024',
      endDate: 'Aug 2024',
      description: 'Engineered a scalable microservice architecture using Node.js and Docker, reducing API latency by 40%.\nImplemented secure JWT-based authentication flows for over 10,000 active users.\nCollaborated with cross-functional teams using Agile methodologies and Jira.'
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Autonomous Internship Intelligence Platform',
      technologies: 'Next.js, Python, PostgreSQL, Redis',
      date: 'Jan 2025 - Present',
      description: 'Developed a high-concurrency ingestion pipeline using Python and aiohttp, processing 500+ listings daily.\nArchitected a deterministic hashing algorithm for 100% write-idempotency across PostgreSQL clusters.\nIntegrated advanced RAG-based AI to provide personalized career recommendations in under 15ms.'
    }
  ]);

  const [skills, setSkills] = useState<SkillCategory[]>([
    { id: '1', category: 'Languages', skills: 'Python, TypeScript, Java, C++, SQL' },
    { id: '2', category: 'Frameworks', skills: 'React, Next.js, Express, Spring Boot' },
    { id: '3', category: 'Tools & DevOps', skills: 'Git, Docker, AWS, Supabase, Linux' }
  ]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const exportPDF = async () => {
    if (!resumeRef.current) return;
    setIsExporting(true);
    
    try {
      const element = resumeRef.current;
      
      // Temporarily override styles for perfect export rendering
      const originalTransform = element.style.transform;
      element.style.transform = 'none'; // Ensure 1:1 scale during capture
      
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Restore styles
      element.style.transform = originalTransform;

      const imgData = canvas.toDataURL('image/png');
      
      // A4 format: 210 x 297 mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // --- Handlers ---
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonal({ ...personal, [e.target.name]: e.target.value });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, id: string, field: string, value: string) => {
    setter((prev) => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, id: string) => {
    setter((prev) => prev.filter(item => item.id !== id));
  };

  const renderBulletPoints = (text: string) => {
    if (!text) return null;
    return text.split('\n').filter(line => line.trim().length > 0).map((line, i) => (
      <li key={i} style={{ marginBottom: '4px', position: 'relative', paddingLeft: '14px' }}>
        <span style={{ position: 'absolute', left: 0, top: 0 }}>•</span>
        {line.trim()}
      </li>
    ));
  };

  return (
    <div className="resume-builder-page" style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', paddingTop: '100px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <Link href="/internships" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--g400)', textDecoration: 'none', marginBottom: '16px', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--g400)'}>
              <ArrowLeft size={16} /> Back to Launchpad
            </Link>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              ATS <span style={{ color: 'var(--c-main)' }}>Resume Engine</span>
            </h1>
            <p style={{ color: 'var(--g300)', marginTop: '8px', fontSize: '1.1rem', maxWidth: '600px' }}>
              Compile a mathematically perfect, 100% ATS-parsable resume. No graphics. No columns. Just pure, parseable signal.
            </p>
          </div>
          
          <button 
            onClick={exportPDF}
            disabled={isExporting}
            style={{
              padding: '16px 32px', background: isExporting ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6', color: '#fff',
              border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: isExporting ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.5)'
            }}
          >
            {isExporting ? <span className="spinner" style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Download size={20} />}
            {isExporting ? 'Compiling PDF...' : 'Export to PDF'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }} className="lg:grid-cols-[45%_55%]">
          
          {/* LEFT: Editor Panel */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }} className="hide-scrollbar">
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {(['personal', 'education', 'experience', 'projects', 'skills'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 20px', background: activeTab === tab ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    color: activeTab === tab ? '#3b82f6' : 'var(--g400)', border: `1px solid ${activeTab === tab ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}`,
                    borderRadius: '8px', textTransform: 'capitalize', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="tab-content" style={{ animation: 'fadeIn 0.3s ease' }}>
              
              {activeTab === 'personal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--g300)', fontSize: '0.9rem' }}>Full Name</label>
                    <input type="text" name="fullName" value={personal.fullName} onChange={handlePersonalChange} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="input-group">
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--g300)', fontSize: '0.9rem' }}>Email</label>
                      <input type="email" name="email" value={personal.email} onChange={handlePersonalChange} style={inputStyle} />
                    </div>
                    <div className="input-group">
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--g300)', fontSize: '0.9rem' }}>Phone</label>
                      <input type="text" name="phone" value={personal.phone} onChange={handlePersonalChange} style={inputStyle} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--g300)', fontSize: '0.9rem' }}>LinkedIn URL (without https://)</label>
                    <input type="text" name="linkedin" value={personal.linkedin} onChange={handlePersonalChange} style={inputStyle} />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--g300)', fontSize: '0.9rem' }}>GitHub URL (without https://)</label>
                    <input type="text" name="github" value={personal.github} onChange={handlePersonalChange} style={inputStyle} />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--g300)', fontSize: '0.9rem' }}>Portfolio/Website (without https://)</label>
                    <input type="text" name="portfolio" value={personal.portfolio} onChange={handlePersonalChange} style={inputStyle} />
                  </div>
                </div>
              )}

              {activeTab === 'education' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {education.map((edu, i) => (
                    <div key={edu.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', position: 'relative' }}>
                      <button onClick={() => removeArrayItem(setEducation, edu.id)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      <h4 style={{ color: 'var(--white)', marginBottom: '16px', fontSize: '1.1rem' }}>Education #{i + 1}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input type="text" placeholder="Institution" value={edu.institution} onChange={(e) => updateArrayItem(setEducation, edu.id, 'institution', e.target.value)} style={inputStyle} />
                        <input type="text" placeholder="Degree/Program" value={edu.degree} onChange={(e) => updateArrayItem(setEducation, edu.id, 'degree', e.target.value)} style={inputStyle} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                          <input type="text" placeholder="Start Date" value={edu.startDate} onChange={(e) => updateArrayItem(setEducation, edu.id, 'startDate', e.target.value)} style={inputStyle} />
                          <input type="text" placeholder="End Date" value={edu.endDate} onChange={(e) => updateArrayItem(setEducation, edu.id, 'endDate', e.target.value)} style={inputStyle} />
                          <input type="text" placeholder="Location" value={edu.location} onChange={(e) => updateArrayItem(setEducation, edu.id, 'location', e.target.value)} style={inputStyle} />
                        </div>
                        <input type="text" placeholder="GPA/CGPA" value={edu.gpa} onChange={(e) => updateArrayItem(setEducation, edu.id, 'gpa', e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setEducation([...education, { id: generateId(), institution: '', degree: '', location: '', startDate: '', endDate: '', gpa: '' }])} style={addBtnStyle}>
                    <Plus size={18} /> Add Education
                  </button>
                </div>
              )}

              {activeTab === 'experience' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {experience.map((exp, i) => (
                    <div key={exp.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', position: 'relative' }}>
                      <button onClick={() => removeArrayItem(setExperience, exp.id)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      <h4 style={{ color: 'var(--white)', marginBottom: '16px', fontSize: '1.1rem' }}>Experience #{i + 1}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <input type="text" placeholder="Company" value={exp.company} onChange={(e) => updateArrayItem(setExperience, exp.id, 'company', e.target.value)} style={inputStyle} />
                          <input type="text" placeholder="Role/Title" value={exp.role} onChange={(e) => updateArrayItem(setExperience, exp.id, 'role', e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                          <input type="text" placeholder="Start Date" value={exp.startDate} onChange={(e) => updateArrayItem(setExperience, exp.id, 'startDate', e.target.value)} style={inputStyle} />
                          <input type="text" placeholder="End Date" value={exp.endDate} onChange={(e) => updateArrayItem(setExperience, exp.id, 'endDate', e.target.value)} style={inputStyle} />
                          <input type="text" placeholder="Location" value={exp.location} onChange={(e) => updateArrayItem(setExperience, exp.id, 'location', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--g300)', fontSize: '0.85rem' }}>Description (One bullet point per line)</label>
                          <textarea placeholder="Engineered X using Y achieving Z..." value={exp.description} onChange={(e) => updateArrayItem(setExperience, exp.id, 'description', e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setExperience([...experience, { id: generateId(), company: '', role: '', location: '', startDate: '', endDate: '', description: '' }])} style={addBtnStyle}>
                    <Plus size={18} /> Add Experience
                  </button>
                </div>
              )}

              {activeTab === 'projects' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {projects.map((proj, i) => (
                    <div key={proj.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', position: 'relative' }}>
                      <button onClick={() => removeArrayItem(setProjects, proj.id)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      <h4 style={{ color: 'var(--white)', marginBottom: '16px', fontSize: '1.1rem' }}>Project #{i + 1}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <input type="text" placeholder="Project Name" value={proj.name} onChange={(e) => updateArrayItem(setProjects, proj.id, 'name', e.target.value)} style={inputStyle} />
                          <input type="text" placeholder="Date (e.g., Fall 2024)" value={proj.date} onChange={(e) => updateArrayItem(setProjects, proj.id, 'date', e.target.value)} style={inputStyle} />
                        </div>
                        <input type="text" placeholder="Technologies (e.g., React, Node, AWS)" value={proj.technologies} onChange={(e) => updateArrayItem(setProjects, proj.id, 'technologies', e.target.value)} style={inputStyle} />
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--g300)', fontSize: '0.85rem' }}>Description (One bullet point per line)</label>
                          <textarea placeholder="Built X resulting in Y..." value={proj.description} onChange={(e) => updateArrayItem(setProjects, proj.id, 'description', e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setProjects([...projects, { id: generateId(), name: '', technologies: '', date: '', description: '' }])} style={addBtnStyle}>
                    <Plus size={18} /> Add Project
                  </button>
                </div>
              )}

              {activeTab === 'skills' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {skills.map((skill) => (
                    <div key={skill.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <input type="text" placeholder="Category (e.g., Languages)" value={skill.category} onChange={(e) => updateArrayItem(setSkills, skill.id, 'category', e.target.value)} style={{ ...inputStyle, width: '200px' }} />
                      <input type="text" placeholder="Skills (comma separated)" value={skill.skills} onChange={(e) => updateArrayItem(setSkills, skill.id, 'skills', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                      <button onClick={() => removeArrayItem(setSkills, skill.id)} style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </div>
                  ))}
                  <button onClick={() => setSkills([...skills, { id: generateId(), category: '', skills: '' }])} style={addBtnStyle}>
                    <Plus size={18} /> Add Skill Category
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Live Preview Panel */}
          <div style={{ display: 'flex', justifyContent: 'center', background: '#111827', borderRadius: '24px', padding: '40px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
            
            {/* THE A4 PAPER */}
            <div 
              ref={resumeRef}
              style={{
                width: '210mm',
                minHeight: '297mm',
                backgroundColor: '#ffffff',
                color: '#000000',
                padding: '16mm 20mm', // Standard ATS margins
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                fontFamily: '"Times New Roman", Times, serif', // The most classic ATS font
                fontSize: '11pt',
                lineHeight: 1.3,
                flexShrink: 0,
                // Optional CSS scaling for small screens could be applied to a wrapper, but we keep raw A4 here for clean canvas capture.
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: '0 0 4px 0', color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>{personal.fullName || 'YOUR NAME'}</h1>
                <div style={{ fontSize: '10pt', color: '#333', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  {personal.email && <span>{personal.email}</span>}
                  {personal.email && personal.phone && <span>|</span>}
                  {personal.phone && <span>{personal.phone}</span>}
                  {(personal.email || personal.phone) && personal.linkedin && <span>|</span>}
                  {personal.linkedin && <span>{personal.linkedin}</span>}
                  {(personal.email || personal.phone || personal.linkedin) && personal.github && <span>|</span>}
                  {personal.github && <span>{personal.github}</span>}
                  {(personal.email || personal.phone || personal.linkedin || personal.github) && personal.portfolio && <span>|</span>}
                  {personal.portfolio && <span>{personal.portfolio}</span>}
                </div>
              </div>

              {/* Education Section */}
              {education.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '8px', color: '#000' }}>Education</h2>
                  {education.map(edu => (
                    <div key={edu.id} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '11pt', color: '#000' }}>{edu.institution}</span>
                        <span style={{ fontSize: '11pt', color: '#000' }}>{edu.location}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontStyle: 'italic', fontSize: '11pt', color: '#333' }}>{edu.degree}{edu.gpa ? `, GPA: ${edu.gpa}` : ''}</span>
                        <span style={{ fontSize: '11pt', color: '#333' }}>{edu.startDate} – {edu.endDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Experience Section */}
              {experience.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '8px', color: '#000' }}>Experience</h2>
                  {experience.map(exp => (
                    <div key={exp.id} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '11pt', color: '#000' }}>{exp.role}</span>
                        <span style={{ fontSize: '11pt', color: '#000' }}>{exp.startDate} – {exp.endDate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                        <span style={{ fontStyle: 'italic', fontSize: '11pt', color: '#333' }}>{exp.company}</span>
                        <span style={{ fontSize: '11pt', color: '#333' }}>{exp.location}</span>
                      </div>
                      <ul style={{ margin: '0', padding: '0', listStyleType: 'none', fontSize: '10.5pt', color: '#333' }}>
                        {renderBulletPoints(exp.description)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects Section */}
              {projects.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '8px', color: '#000' }}>Projects</h2>
                  {projects.map(proj => (
                    <div key={proj.id} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                        <span style={{ fontSize: '11pt', color: '#000' }}>
                          <span style={{ fontWeight: 'bold' }}>{proj.name}</span>
                          {proj.technologies && <span style={{ fontStyle: 'italic', color: '#333' }}> | {proj.technologies}</span>}
                        </span>
                        <span style={{ fontSize: '11pt', color: '#000' }}>{proj.date}</span>
                      </div>
                      <ul style={{ margin: '0', padding: '0', listStyleType: 'none', fontSize: '10.5pt', color: '#333' }}>
                        {renderBulletPoints(proj.description)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Section */}
              {skills.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '8px', color: '#000' }}>Technical Skills</h2>
                  <div style={{ fontSize: '10.5pt', color: '#333' }}>
                    {skills.map(skill => (
                      <div key={skill.id} style={{ marginBottom: '2px' }}>
                        <span style={{ fontWeight: 'bold', color: '#000' }}>{skill.category}:</span> {skill.skills}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: 'var(--white)',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'all 0.2s'
};

const addBtnStyle = {
  width: '100%',
  padding: '16px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px dashed rgba(255,255,255,0.2)',
  borderRadius: '12px',
  color: 'var(--white)',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s'
};
