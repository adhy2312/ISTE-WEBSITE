use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn analyze_resume_fast(resume_text: &str, _internships_json: &str) -> String {
    // Advanced Structural Parseability Engine (Rust)
    let resume_lower = resume_text.to_lowercase();
    let total_chars = resume_text.len();
    
    if total_chars < 50 {
        return r#"{ "status": "error", "message": "Insufficient data" }"#.to_string();
    }
    
    // 1. Whitespace Ratio Analysis
    let whitespace_chars = resume_text.chars().filter(|c| c.is_whitespace()).count();
    let whitespace_ratio = (whitespace_chars as f64 / total_chars as f64) * 100.0;
    
    // 2. Active Verb Scan (High-impact keywords)
    let active_verbs = ["architected", "spearheaded", "engineered", "optimized", "developed", "led", "managed", "deployed", "implemented", "reduced", "increased"];
    let mut verb_hits = 0;
    for verb in active_verbs.iter() {
        if resume_lower.contains(verb) { verb_hits += 1; }
    }
    
    // 3. Sentence parsing / Bullet points
    let sentences: Vec<&str> = resume_text.split(|c| c == '.' || c == '\n').filter(|s| s.trim().len() > 10).collect();
    let avg_sentence_length = if sentences.is_empty() { 0 } else { total_chars / sentences.len() };
    
    // Compute Offline Parseability Score
    let mut score = 50.0;
    // Ideal whitespace is ~15-25%
    if whitespace_ratio > 10.0 && whitespace_ratio < 30.0 { score += 15.0; } else { score -= 10.0; }
    // Reward active verbs
    score += (verb_hits as f64 * 3.0).min(20.0);
    // Punish massive unreadable blocks (sentences too long)
    if avg_sentence_length > 150 { score -= 15.0; } else { score += 15.0; }
    
    let final_score = score.clamp(0.0, 100.0) as i32;
    
    format!(
        r#"{{ "status": "success", "engine": "rust-wasm", "parseability_score": {}, "metrics": {{ "whitespace_ratio": {:.1}, "active_verbs_found": {}, "avg_sentence_length": {} }} }}"#,
        final_score, whitespace_ratio, verb_hits, avg_sentence_length
    )
}

