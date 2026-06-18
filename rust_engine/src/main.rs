/// Rust Resume Parseability Engine
/// CLI tool invoked by the Python internship engine:
///   ./rust_engine <resume_text> <internships_json>
/// Returns a JSON string with the parseability score.
///
/// Root cause of previous CI failure: the old lib.rs used wasm_bindgen which
/// requires a WASM target — it cannot compile as a native Linux binary.
/// We removed wasm_bindgen entirely and inlined the logic here.

use std::env;
use std::io::{self, Read};

fn analyze_resume_fast(resume_text: &str, _internships_json: &str) -> String {
    let resume_lower = resume_text.to_lowercase();
    let total_chars = resume_text.len();

    if total_chars < 50 {
        return r#"{"status":"error","message":"Insufficient data"}"#.to_string();
    }

    // 1. Whitespace Ratio Analysis
    let whitespace_chars = resume_text.chars().filter(|c| c.is_whitespace()).count();
    let whitespace_ratio = (whitespace_chars as f64 / total_chars as f64) * 100.0;

    // 2. Active Verb Scan (High-impact keywords)
    let active_verbs = [
        "architected", "spearheaded", "engineered", "optimized",
        "developed", "led", "managed", "deployed", "implemented",
        "reduced", "increased", "built", "designed", "launched",
    ];
    let verb_hits: usize = active_verbs.iter().filter(|v| resume_lower.contains(*v)).count();

    // 3. Sentence / bullet-point analysis
    let sentences: Vec<&str> = resume_text
        .split(|c| c == '.' || c == '\n')
        .filter(|s| s.trim().len() > 10)
        .collect();
    let avg_sentence_length = if sentences.is_empty() {
        0
    } else {
        total_chars / sentences.len()
    };

    // 4. Section header detection
    let section_keywords = ["experience", "education", "skills", "projects", "certifications"];
    let section_hits: usize = section_keywords.iter().filter(|k| resume_lower.contains(*k)).count();

    // Compute Offline Parseability Score
    let mut score = 50.0_f64;
    if whitespace_ratio > 10.0 && whitespace_ratio < 30.0 {
        score += 15.0;
    } else {
        score -= 10.0;
    }
    score += (verb_hits as f64 * 3.0).min(20.0);
    score += (section_hits as f64 * 2.0).min(10.0);
    if avg_sentence_length > 150 {
        score -= 15.0;
    } else {
        score += 5.0;
    }

    let final_score = score.clamp(0.0, 100.0) as i32;

    format!(
        r#"{{"status":"success","engine":"rust-native","parseability_score":{},"metrics":{{"whitespace_ratio":{:.1},"active_verbs_found":{},"section_headers_found":{},"avg_sentence_length":{}}}}}"#,
        final_score, whitespace_ratio, verb_hits, section_hits, avg_sentence_length
    )
}

fn main() {
    let args: Vec<String> = env::args().collect();

    // Mode 1: called with two CLI args
    //   ./rust_engine "<resume_text>" "<internships_json>"
    if args.len() == 3 {
        let result = analyze_resume_fast(&args[1], &args[2]);
        println!("{}", result);
        return;
    }

    // Mode 2: JSON piped via stdin
    //   echo '{"resume":"...","internships":"..."}' | ./rust_engine
    let mut buffer = String::new();
    if io::stdin().read_to_string(&mut buffer).unwrap_or(0) > 0 {
        // Try to parse as {"resume": "...", "internships": "..."}
        let resume = extract_json_str(&buffer, "resume");
        let internships = extract_json_str(&buffer, "internships");
        let result = analyze_resume_fast(&resume, &internships);
        println!("{}", result);
        return;
    }

    // No valid input
    eprintln!("Usage: rust_engine <resume_text> <internships_json>");
    eprintln!("   or: echo '{{\"resume\":\"...\",\"internships\":\"...\"}}' | rust_engine");
    std::process::exit(1);
}

/// Minimal JSON string extractor (avoids pulling in serde just for this).
fn extract_json_str(json: &str, key: &str) -> String {
    let pat = format!("\"{}\"", key);
    if let Some(k_pos) = json.find(&pat) {
        let after_key = &json[k_pos + pat.len()..];
        if let Some(colon) = after_key.find(':') {
            let after_colon = after_key[colon + 1..].trim_start();
            if after_colon.starts_with('"') {
                // Find closing quote, handling escaped quotes
                let mut chars = after_colon[1..].chars().peekable();
                let mut value = String::new();
                let mut escaped = false;
                for c in chars.by_ref() {
                    if escaped { value.push(c); escaped = false; }
                    else if c == '\\' { escaped = true; }
                    else if c == '"' { break; }
                    else { value.push(c); }
                }
                return value;
            }
        }
    }
    String::new()
}
