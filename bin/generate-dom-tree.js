#!/usr/bin/env node

/*
 **********************************************************************
 * File       : bin/generate-dom-tree.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Generates a Graphviz DOT file from an HTML file's DOM structure.
 *   Usage: node generate-dom-tree.js <html-file> [output-file]
 *   Example:
 *     node generate-dom-tree.js index.html index.dot
 *     dot -Tpng index.dot -o index-dom-tree.png
 *     dot -Tsvg index.dot -o index-dom-tree.svg
 **********************************************************************
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Usage: node generate-dom-tree.js <html-file> [output-file]');
    console.error('Example: node generate-dom-tree.js index.html index.dot');
    process.exit(1);
}

const htmlFile = args[0];
const outputFile = args[1] || htmlFile.replace(/\.html$/, '.dot');

// Check if input file exists
if (!fs.existsSync(htmlFile)) {
    console.error(`Error: File '${htmlFile}' not found`);
    process.exit(1);
}

// Read and parse HTML
const html = fs.readFileSync(htmlFile, 'utf8');
const $ = cheerio.load(html);

let nodeCounter = 0;
const nodeMap = new Map();
let dotContent = 'digraph DOM {\n';
dotContent += '    rankdir=TB;\n';
dotContent += '    node [shape=box, style=rounded, fontname="Arial"];\n';
dotContent += '    edge [fontname="Arial", fontsize=10];\n\n';

/**
 * Get a clean label for a node
 */
function getNodeLabel(element) {
    const tagName = element.name;
    const id = $(element).attr('id');
    const classes = $(element).attr('class');

    let label = tagName;

    if (id) {
        label += `\\n#${id}`;
    }

    if (classes) {
        const classList = classes.split(/\s+/).slice(0, 2); // Max 2 classes
        if (classList.length > 0) {
            label += `\\n.${classList.join(' .')}`;
        }
    }

    return label;
}

/**
 * Get node color based on tag type
 */
function getNodeColor(tagName) {
    const colors = {
        'html': '#FFE6E6',
        'head': '#E6F3FF',
        'body': '#E6FFE6',
        'header': '#FFF4E6',
        'main': '#F0E6FF',
        'footer': '#FFE6F0',
        'nav': '#E6FFFF',
        'section': '#FFFFCC',
        'article': '#FFE6CC',
        'div': '#F5F5F5',
        'p': '#FFFFFF',
        'ul': '#E6E6FF',
        'ol': '#E6E6FF',
        'li': '#F0F0FF'
    };
    return colors[tagName] || '#FFFFFF';
}

/**
 * Recursively build the DOT graph
 */
function buildGraph(element, parentId = null) {
    // Skip text nodes and comments
    if (element.type !== 'tag') {
        return;
    }

    const nodeId = `node${nodeCounter++}`;
    nodeMap.set(element, nodeId);

    const label = getNodeLabel(element);
    const color = getNodeColor(element.name);

    // Add node
    dotContent += `    ${nodeId} [label="${label}", fillcolor="${color}", style="rounded,filled"];\n`;

    // Add edge from parent
    if (parentId) {
        dotContent += `    ${parentId} -> ${nodeId};\n`;
    }

    // Process children
    const children = $(element).children().toArray();

    // Limit depth to avoid huge diagrams
    if (children.length > 0 && nodeCounter < 500) {
        children.forEach(child => {
            buildGraph(child, nodeId);
        });
    }
}

// Start from the root element
const root = $.root().children()[0];
if (root) {
    buildGraph(root);
} else {
    console.error('Error: Could not parse HTML document');
    process.exit(1);
}

dotContent += '}\n';

// Write output
fs.writeFileSync(outputFile, dotContent, 'utf8');
console.log(`✓ DOM tree generated: ${outputFile}`);
console.log(`  Total nodes: ${nodeCounter}`);
console.log(`\nGenerate diagram with:`);
console.log(`  dot -Tpng ${outputFile} -o ${outputFile.replace('.dot', '.png')}`);
console.log(`  dot -Tsvg ${outputFile} -o ${outputFile.replace('.dot', '.svg')}`);
