const fs = require('fs');

async function inspectReference() {
  try {
    const res = await fetch('https://casestudio.nxtcurve.com/assets/index-Bd24xAIx.js');
    const text = await res.text();
    console.log('Bundle fetched. Size:', text.length);

    // Search for routing, features, pages, modals, navigation
    const pathMatches = text.match(/path:\s*['"][^'"]+['"]/g) || [];
    console.log('\n--- ROUTES ---');
    console.log([...new Set(pathMatches)]);

    // Check for keyword features
    const keywords = [
      'case', 'curate', 'flash', 'hypothetical', 'signal', 'library', 'trending', 
      'analytics', 'co', 'po', 'rubric', 'grading', 'socratic', 'cold-call', 
      'board', 'poll', 'pod', 'audio', 'export', 'pdf', 'docx', 'approval', 
      'review', 'certificate', 'portfolio', 'pricing', 'alumni', 'subscription',
      'guide', 'assistant', 'tokens', 'budget'
    ];
    console.log('\n--- KEYWORD OCCURRENCES ---');
    for (const kw of keywords) {
      const reg = new RegExp(kw, 'gi');
      const count = (text.match(reg) || []).length;
      console.log(`${kw}: ${count}`);
    }
  } catch (err) {
    console.error('Inspection failed:', err);
  }
}

inspectReference();
