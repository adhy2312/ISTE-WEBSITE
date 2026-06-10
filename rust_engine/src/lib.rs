use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn analyze_resume_fast(resume_text: &str, internships_json: &str) -> String {
    // A blazing fast, zero-allocation-heavy Rust implementation of the resume analyzer
    // This is a placeholder logic that proves the integration works.
    
    let resume_lower = resume_text.to_lowercase();
    
    // In a real scenario, we'd parse the JSON, but to keep dependencies minimal 
    // for this demo, we'll just do a fast keyword occurrence count on the raw text.
    
    let mut score = 0;
    
    let keywords = ["react", "node", "typescript", "python", "machine learning", "design", "figma", "rust", "go", "c++", "java"];
    
    for kw in keywords.iter() {
        if resume_lower.contains(kw) {
            score += 10;
        }
    }
    
    // Return a structured JSON response
    format!(
        r#"{{ "status": "success", "engine": "rust-wasm", "computed_score": {}, "message": "Blazing fast compute via Rust WebAssembly" }}"#,
        score
    )
}
