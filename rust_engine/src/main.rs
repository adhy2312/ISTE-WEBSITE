use std::env;
use std::io::{self, Read};

// Import the WASM library's logic so we don't duplicate it.
// The library is named `rust_engine`.
use rust_engine::analyze_resume_fast;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    // We expect this to be called as: ./rust_engine <resume_text> <internships_json>
    // But since resume text can be huge, we should ideally read from stdin or files.
    // For now, to keep it simple and backwards compatible with how python might invoke it:
    if args.len() == 3 {
        let resume_text = &args[1];
        let internships_json = &args[2];
        let result = analyze_resume_fast(resume_text, internships_json);
        println!("{}", result);
    } else {
        // Read from stdin if no args (so Python can pipe huge JSON/text to it)
        let mut buffer = String::new();
        io::stdin().read_to_string(&mut buffer).unwrap_or(0);
        
        // This is a dummy response for now if invoked without arguments.
        // In a real scenario, we would parse JSON from stdin.
        println!(r#"{{ "status": "error", "message": "Expected 2 arguments or proper stdin" }}"#);
    }
}
