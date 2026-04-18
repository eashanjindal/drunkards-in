// generate-post.js
// Runs daily via GitHub Actions. Picks next topic, calls Claude API,
// saves as Hugo-compatible Markdown, commits to repo.

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getNextTopic() {
  const topicsPath = path.join('scripts', 'topics.json');
  const publishedPath = path.join('scripts', 'published.json');

  const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));

  let published = [];
  if (fs.existsSync(publishedPath)) {
    published = JSON.parse(fs.readFileSync(publishedPath, 'utf-8'));
  }

  const publishedTitles = new Set(published.map(p => p.title));
  const remaining = topics.filter(t => !publishedTitles.has(t.title));

  if (remaining.length === 0) {
    console.log('All topics published. Cycling back to beginning.');
    published = [];
    fs.writeFileSync(publishedPath, JSON.stringify([], null, 2));
    return topics[0];
  }

  return remaining[0];
}

function markTopicPublished(topic) {
  const publishedPath = path.join('scripts', 'published.json');
  let published = [];
  if (fs.existsSync(publishedPath)) {
    published = JSON.parse(fs.readFileSync(publishedPath, 'utf-8'));
  }
  published.push({ title: topic.title, date: getTodayDate() });
  fs.writeFileSync(publishedPath, JSON.stringify(published, null, 2));
}

function buildPrompt(topic) {
  const isRecipe = topic.type === 'recipe';
  const isBuyingGuide = topic.type === 'buying-guide';

  return `You are the lead writer for Drunkards.in, India's home bar authority. Write a comprehensive, genuinely useful blog post for an Indian audience.

TOPIC: ${topic.title}
PRIMARY KEYWORD: ${topic.keyword}
CATEGORY: ${topic.category}
TYPE: ${topic.type}

WRITING GUIDELINES:
- Write for Indian home bartenders. Mention INR prices where relevant, reference brands available in India.
- Be direct, confident, and conversational. No fluff, no padding.
- Length: 1800–2200 words
- Tone: Like a knowledgeable friend who drinks well, not a corporate brand

REQUIRED STRUCTURE (use these exact H2 headings):

## [Direct answer / TL;DR in 2-3 sentences]

## What You Need to Know About [topic]
[Core educational content]

## [Main content section - recipe steps OR product recommendations OR key factors]

${isRecipe ? `## The Ingredients
List with amounts and notes on Indian substitutes

## Step-by-Step Method
Numbered steps, precise and clear

## Variations
3-4 variations with brief descriptions` : ''}

${isBuyingGuide ? `## What to Look For
Key factors when buying

## Our Top Picks
At least 5 recommendations with INR price range and where to find in India` : ''}

## Common Mistakes to Avoid
3-5 specific, actionable mistakes

## FAQ
Exactly 5 questions and direct answers. Start each question with Q: and answer with A:

## Related Reads
End with: "If you found this useful, also read:" followed by 3-4 internal link suggestions formatted as: [Link text](/suggested-slug/)

IMPORTANT:
- Include at least one comparison table where relevant
- Every factual claim should feel authoritative
- India-specific context throughout (pricing in ₹, brands available in India)
- No filler phrases like "In conclusion" or "I hope this helps"
- Write the complete article, do not truncate

Return ONLY the article body (no frontmatter, no title). Start directly with the first section.`;
}

function buildFrontmatter(topic, content) {
  const date = getTodayDate();
  const slug = slugify(topic.title);
  const description = content.split('\n')[0].replace(/^#+\s*/, '').substring(0, 160);

  return `---
title: "${topic.title.replace(/"/g, '\\"')}"
date: ${date}
slug: "${slug}"
description: "${description.replace(/"/g, '\\"')}"
category: "${topic.category}"
keywords: "${topic.keyword}"
type: "${topic.type}"
draft: false
affiliate: ${topic.type === 'buying-guide' ? 'true' : 'false'}
recipe: ${topic.type === 'recipe' ? 'true' : 'false'}
---

`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🍹 Drunkards.in — Daily Post Generator');
  console.log('Date:', getTodayDate());

  const topic = getNextTopic();
  console.log('Topic:', topic.title);
  console.log('Section:', topic.section);

  const prompt = buildPrompt(topic);

  console.log('Calling Claude API...');

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0].text;
  console.log(`Generated ${content.split(' ').length} words`);

  const frontmatter = buildFrontmatter(topic, content);
  const fullPost = frontmatter + content;

  // Determine output path based on section
  const section = topic.section || 'posts';
  const dir = path.join('content', section);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${getTodayDate()}-${slugify(topic.title)}.md`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, fullPost);
  console.log('✅ Post saved:', filepath);

  markTopicPublished(topic);
  console.log('📋 Topic marked as published');
  console.log('Done! Netlify will auto-deploy the new post.');
}

main().catch(err => {
  console.error('❌ Error generating post:', err);
  process.exit(1);
});
