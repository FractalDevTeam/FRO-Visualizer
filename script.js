/**
 * FRO Network Visualizer - Enhanced Script
 * Fractal Resonance Ontology - Mathematical Problem Network Analysis
 *
 * This visualization maps mathematical problems through quantum-fractal analysis,
 * revealing deep structural relationships across different mathematical fields.
 */

// ============================================
// Global State Management
// ============================================

const state = {
    data: [],
    categories: [],
    nodes: [],
    links: [],
    selectedCategory: 'All',
    fidelityThreshold: 0,
    linkStrengthThreshold: 0.5,
    showLabels: true,
    highlightSolved: true,
    topologyMode: false,
    hoveredNode: null,
    selectedNode: null,
    simulation: null,
    svg: null,
    zoom: null,
    width: 0,
    height: 0
};

// Topology-related field identifiers
const TOPOLOGY_TERMS = [
    'Topology', 'Homology', 'Manifold', 'Geometric',
    'Differential Geometry', 'Knot', 'Cohomology', 'Homotopy',
    'Algebraic Geometry', 'Sheaf', 'Category Theory'
];

// Color scale for categories
const CATEGORY_COLORS = d3.scaleOrdinal()
    .range([
        '#4169e1', '#20b2aa', '#ff6b6b', '#ffd93d', '#6bcb77',
        '#9370db', '#ff8c42', '#00b894', '#e84393', '#0984e3'
    ]);

// ============================================
// Utility Functions
// ============================================

/**
 * Check if a category is topology-related
 */
function isTopologyRelated(category) {
    if (!category) return false;
    return TOPOLOGY_TERMS.some(term => category.includes(term));
}

/**
 * Format large numbers for display
 */
function formatNumber(num) {
    if (num === undefined || num === null) return '0.00';
    if (num > 1000000) return num.toExponential(2);
    if (num > 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toFixed(2);
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// Data Loading & Processing
// ============================================

async function loadData() {
    try {
        showLoading();

        // Ensure PapaParse is loaded
        if (typeof Papa === 'undefined') {
            throw new Error('PapaParse library not loaded');
        }

        const response = await fetch('./data/benchmark_results_v4_11_2.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvData = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvData, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function(results) {
                    if (results.errors.length > 0) {
                        console.warn('CSV parsing warnings:', results.errors);
                    }

                    state.data = results.data;

                    // Extract unique categories
                    const uniqueCategories = [...new Set(state.data.map(row => row.category))];
                    state.categories = ['All', ...uniqueCategories.filter(c => c).sort()];

                    // Populate category dropdown
                    populateCategoryDropdown();

                    // Update last updated timestamp
                    document.getElementById('last-updated').textContent = new Date().toLocaleDateString();

                    resolve();
                },
                error: function(error) {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error loading data:', error);
        showError(error.message);
        throw error;
    }
}

function populateCategoryDropdown() {
    const selectElement = document.getElementById('category-select');
    selectElement.innerHTML = '';

    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category === 'All' ? 'All Fields' : category;
        selectElement.appendChild(option);
    });
}

// ============================================
// Node & Link Generation
// ============================================

function processData() {
    // Filter data by selected category and fidelity threshold
    let filteredData = state.data;

    if (state.selectedCategory !== 'All') {
        filteredData = filteredData.filter(d => d.category === state.selectedCategory);
    }

    if (state.fidelityThreshold > 0) {
        filteredData = filteredData.filter(d => (d.quantum_fidelity || 0) >= state.fidelityThreshold * 50);
    }

    // Create nodes
    state.nodes = filteredData.map(d => ({
        id: d.theory,
        category: d.category,
        quantum_fidelity: d.quantum_fidelity || 0,
        stability: d.stability || 0,
        entropy: d.entropy || 0,
        cqc: d.cqc || 0,
        result: d.known_result || '',
        isTopology: d.category === 'Topology',
        isTopologyRelated: isTopologyRelated(d.category),
        isSolved: (d.known_result || '').toLowerCase().includes('solved')
    }));

    // Create links based on similarity
    state.links = [];
    const nodeCount = state.nodes.length;

    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const nodeA = state.nodes[i];
            const nodeB = state.nodes[j];

            // In topology mode, only connect topology-related nodes
            if (state.topologyMode) {
                if (!nodeA.isTopology && !nodeA.isTopologyRelated) continue;
                if (!nodeB.isTopology && !nodeB.isTopologyRelated) continue;
            }

            // Calculate similarity metrics
            const qfDiff = Math.abs(nodeA.quantum_fidelity - nodeB.quantum_fidelity) / 50;
            const stabDiff = Math.abs(nodeA.stability - nodeB.stability);
            const qfSimilarity = 1 - Math.min(qfDiff, 1);
            const stabSimilarity = 1 - stabDiff;

            // Calculate weighted similarity
            let similarity;
            if (nodeA.isTopology && nodeB.isTopology) {
                // Pure topology connections are weighted higher
                similarity = (qfSimilarity * 0.6 + stabSimilarity * 0.4) * 1.3;
            } else if (nodeA.isTopologyRelated && nodeB.isTopologyRelated) {
                similarity = (qfSimilarity * 0.6 + stabSimilarity * 0.4) * 1.2;
            } else if (nodeA.category === nodeB.category) {
                // Same category connections
                similarity = (qfSimilarity * 0.5 + stabSimilarity * 0.5) * 1.1;
            } else {
                similarity = qfSimilarity * 0.7 + stabSimilarity * 0.3;
            }

            // Apply link strength threshold
            if (similarity >= state.linkStrengthThreshold) {
                state.links.push({
                    source: nodeA.id,
                    target: nodeB.id,
                    strength: Math.min(similarity, 1),
                    isTopological: (nodeA.isTopology || nodeA.isTopologyRelated) &&
                                   (nodeB.isTopology || nodeB.isTopologyRelated)
                });
            }
        }
    }

    // Limit links for performance on large datasets
    if (state.links.length > 500) {
        state.links.sort((a, b) => b.strength - a.strength);
        state.links = state.links.slice(0, 500);
    }
}

// ============================================
// Visualization Creation
// ============================================

function createVisualization() {
    // Clear previous visualization
    d3.select("#visualization").selectAll("*").remove();

    // Process data to create nodes and links
    processData();

    // Get container dimensions
    const container = document.getElementById("visualization");
    state.width = container.clientWidth || 800;
    state.height = container.clientHeight || 600;

    // Create SVG
    state.svg = d3.select("#visualization")
        .append("svg")
        .attr("viewBox", `0 0 ${state.width} ${state.height}`)
        .attr("width", "100%")
        .attr("height", "100%");

    // Add definitions for gradients and filters
    const defs = state.svg.append("defs");

    // Background gradient
    const bgGradient = defs.append("linearGradient")
        .attr("id", "bg-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%");
    bgGradient.append("stop").attr("offset", "0%").attr("stop-color", "#1a0033");
    bgGradient.append("stop").attr("offset", "100%").attr("stop-color", "#000020");

    // Glow filter for nodes
    const glowFilter = defs.append("filter")
        .attr("id", "glow")
        .attr("x", "-50%").attr("y", "-50%")
        .attr("width", "200%").attr("height", "200%");
    glowFilter.append("feGaussianBlur")
        .attr("stdDeviation", "3")
        .attr("result", "coloredBlur");
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Add background
    state.svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "url(#bg-gradient)");

    // Create main group for zoom/pan
    const mainGroup = state.svg.append("g").attr("class", "main-group");

    // Create zoom behavior
    state.zoom = d3.zoom()
        .scaleExtent([0.2, 5])
        .on("zoom", (event) => {
            mainGroup.attr("transform", event.transform);
        });

    state.svg.call(state.zoom);

    // Create force simulation
    state.simulation = d3.forceSimulation(state.nodes)
        .force("link", d3.forceLink(state.links)
            .id(d => d.id)
            .distance(d => 150 * (1 - d.strength)))
        .force("charge", d3.forceManyBody()
            .strength(d => d.isTopology ? -200 : -100))
        .force("center", d3.forceCenter(state.width / 2, state.height / 2))
        .force("collide", d3.forceCollide()
            .radius(d => getNodeRadius(d) + 5));

    // Create link elements
    const linkGroup = mainGroup.append("g").attr("class", "links");
    const link = linkGroup.selectAll("line")
        .data(state.links)
        .enter()
        .append("line")
        .attr("stroke", d => d.isTopological ? "#e066ff" : "#4169e1")
        .attr("stroke-width", d => Math.max(0.5, d.strength * 3))
        .attr("stroke-opacity", d => {
            const base = d.isTopological ? 0.6 : 0.3;
            return base * (d.strength > 0.8 ? 1 : 0.6);
        });

    // Create node groups
    const nodeGroup = mainGroup.append("g").attr("class", "nodes");
    const node = nodeGroup.selectAll("g")
        .data(state.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded))
        .on("mouseover", handleNodeHover)
        .on("mouseout", handleNodeLeave)
        .on("click", handleNodeClick);

    // Add circles
    node.append("circle")
        .attr("r", d => getNodeRadius(d))
        .attr("fill", d => getNodeColor(d))
        .attr("stroke", d => d.isSolved && state.highlightSolved ? "#FFD700" : "#ffffff")
        .attr("stroke-width", d => d.isSolved && state.highlightSolved ? 3 : 0.5)
        .attr("filter", d => d.isTopology ? "url(#glow)" : null);

    // Add labels
    node.append("text")
        .attr("dx", d => getNodeRadius(d) + 4)
        .attr("dy", ".35em")
        .attr("font-size", "10px")
        .attr("font-family", "'JetBrains Mono', monospace")
        .attr("fill", "#ffffff")
        .text(d => d.id)
        .style("opacity", state.showLabels ? 0.8 : 0)
        .style("pointer-events", "none");

    // Update simulation on tick with bounds checking
    state.simulation.on("tick", () => {
        // Clamp node positions to stay within visualization bounds
        const padding = 30;
        state.nodes.forEach(d => {
            const radius = getNodeRadius(d);
            d.x = Math.max(padding + radius, Math.min(state.width - padding - radius, d.x));
            d.y = Math.max(padding + radius, Math.min(state.height - padding - radius, d.y));
        });

        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });

    // Update statistics
    updateStatistics();

    hideLoading();
}

function getNodeRadius(d) {
    const baseRadius = d.isTopology ? 10 : (d.isTopologyRelated ? 8 : 6);
    const fidelityBonus = d.quantum_fidelity / 10;
    return baseRadius + fidelityBonus;
}

function getNodeColor(d) {
    if (d.isTopology) return "#9370db";
    if (d.isTopologyRelated) return "#b19cd9";
    return CATEGORY_COLORS(d.category);
}

// ============================================
// Drag Handlers
// ============================================

function dragStarted(event, d) {
    if (!event.active) state.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) state.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// ============================================
// Interaction Handlers
// ============================================

function handleNodeHover(event, d) {
    state.hoveredNode = d;

    // Highlight the node
    d3.select(this).select("circle")
        .transition().duration(200)
        .attr("r", getNodeRadius(d) * 1.3);

    // Show label
    d3.select(this).select("text")
        .transition().duration(200)
        .style("opacity", 1);

    // Highlight connected links
    d3.selectAll(".links line")
        .transition().duration(200)
        .attr("stroke-opacity", link => {
            if (link.source.id === d.id || link.target.id === d.id) {
                return 0.9;
            }
            return 0.1;
        });

    // Update info panel
    updateNodeInfo(d);
}

function handleNodeLeave(event, d) {
    state.hoveredNode = null;

    // Reset node size
    d3.select(this).select("circle")
        .transition().duration(200)
        .attr("r", getNodeRadius(d));

    // Hide label if not in show labels mode
    if (!state.showLabels) {
        d3.select(this).select("text")
            .transition().duration(200)
            .style("opacity", 0);
    }

    // Reset link opacity
    d3.selectAll(".links line")
        .transition().duration(200)
        .attr("stroke-opacity", link => {
            const base = link.isTopological ? 0.6 : 0.3;
            return base * (link.strength > 0.8 ? 1 : 0.6);
        });

    // Show default info if no node selected
    if (!state.selectedNode) {
        showDefaultInfo();
    }
}

function handleNodeClick(event, d) {
    event.stopPropagation();
    state.selectedNode = d;
    updateNodeInfo(d);
}

// ============================================
// Info Panel Updates
// ============================================

function updateNodeInfo(node) {
    const defaultInfo = document.getElementById('default-info');
    const nodeInfo = document.getElementById('node-info');
    const nodeDetails = document.getElementById('node-details');

    if (!defaultInfo || !nodeInfo || !nodeDetails) return;

    defaultInfo.style.display = 'none';
    nodeInfo.style.display = 'block';

    const relationshipText = node.isTopology ?
        "This is a pure topology problem with significant fractal resonance properties. It forms a core node in the quantum-fractal network." :
        (node.isTopologyRelated ?
            "This problem has strong connections to topological mathematics, exhibiting related fractal patterns." :
            "This problem may have indirect connections to topology through shared quantum-fractal properties.");

    nodeDetails.innerHTML = `
        <h3>${node.id}</h3>
        <div class="field-badge">${node.category}</div>

        <div class="metric">
            <div class="metric-header">
                <span>Quantum Fidelity</span>
                <span>${formatNumber(node.quantum_fidelity)}</span>
            </div>
            <div class="metric-bar">
                <div class="metric-fill quantum-fill" style="width: ${Math.min(100, node.quantum_fidelity * 2)}%"></div>
            </div>
        </div>

        <div class="metric">
            <div class="metric-header">
                <span>Stability Index</span>
                <span>${formatNumber(node.stability)}</span>
            </div>
            <div class="metric-bar">
                <div class="metric-fill stability-fill" style="width: ${Math.min(100, node.stability * 100)}%"></div>
            </div>
        </div>

        <div class="metric">
            <div class="metric-header">
                <span>Entropy</span>
                <span>${formatNumber(node.entropy)}</span>
            </div>
            <div class="metric-bar">
                <div class="metric-fill entropy-fill" style="width: ${Math.min(100, node.entropy * 40)}%"></div>
            </div>
        </div>

        <div class="metric">
            <div class="metric-header">
                <span>CQC Score</span>
                <span>${formatNumber(node.cqc)}</span>
            </div>
            <div class="metric-bar">
                <div class="metric-fill cqc-fill" style="width: ${Math.min(100, Math.log10(Math.max(1, node.cqc)) * 20)}%"></div>
            </div>
        </div>

        ${node.result ? `
            <div class="status-badge ${node.isSolved ? 'solved' : ''}">
                <span class="icon">${node.isSolved ? '✓' : '○'}</span>
                <span class="text">${node.result}</span>
            </div>
        ` : ''}

        <div class="relationship-info">
            ${relationshipText}
        </div>
    `;
}

function showDefaultInfo() {
    const defaultInfo = document.getElementById('default-info');
    const nodeInfo = document.getElementById('node-info');

    if (defaultInfo) defaultInfo.style.display = 'block';
    if (nodeInfo) nodeInfo.style.display = 'none';
}

function updateStatistics() {
    document.getElementById('total-nodes').textContent = state.nodes.length;
    document.getElementById('total-links').textContent = state.links.length;

    // Calculate average fidelity
    const totalFidelity = state.nodes.reduce((sum, n) => sum + (n.quantum_fidelity || 0), 0);
    const avgFidelity = state.nodes.length > 0 ? totalFidelity / state.nodes.length : 0;
    document.getElementById('avg-fidelity').textContent = avgFidelity.toFixed(2);
}

// ============================================
// Control Panel Event Handlers
// ============================================

function setupControls() {
    // Category filter
    document.getElementById('category-select').addEventListener('change', function() {
        state.selectedCategory = this.value;
        createVisualization();
    });

    // Fidelity threshold
    const fidelitySlider = document.getElementById('fidelity-threshold');
    const fidelityValue = document.getElementById('fidelity-value');
    fidelitySlider.addEventListener('input', debounce(function() {
        state.fidelityThreshold = parseFloat(this.value);
        fidelityValue.textContent = state.fidelityThreshold.toFixed(2);
        createVisualization();
    }, 150));

    // Link strength threshold
    const linkSlider = document.getElementById('link-strength');
    const linkValue = document.getElementById('link-value');
    linkSlider.addEventListener('input', debounce(function() {
        state.linkStrengthThreshold = parseFloat(this.value);
        linkValue.textContent = state.linkStrengthThreshold.toFixed(2);
        createVisualization();
    }, 150));

    // Show labels toggle
    document.getElementById('show-labels').addEventListener('change', function() {
        state.showLabels = this.checked;
        d3.selectAll('.node text')
            .transition().duration(200)
            .style('opacity', state.showLabels ? 0.8 : 0);
    });

    // Highlight solved toggle
    document.getElementById('show-solved').addEventListener('change', function() {
        state.highlightSolved = this.checked;
        d3.selectAll('.node circle')
            .attr('stroke', d => d.isSolved && state.highlightSolved ? '#FFD700' : '#ffffff')
            .attr('stroke-width', d => d.isSolved && state.highlightSolved ? 3 : 0.5);
    });

    // Topology mode toggle
    document.getElementById('topology-mode').addEventListener('change', function() {
        state.topologyMode = this.checked;
        createVisualization();
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (!searchTerm) {
            // Reset highlighting
            d3.selectAll('.node circle')
                .attr('stroke', d => d.isSolved && state.highlightSolved ? '#FFD700' : '#ffffff')
                .attr('stroke-width', d => d.isSolved && state.highlightSolved ? 3 : 0.5);
            d3.selectAll('.node text')
                .style('opacity', state.showLabels ? 0.8 : 0);
            return;
        }

        // Highlight matching nodes
        d3.selectAll('.node circle')
            .attr('stroke', d => {
                if (d.id.toLowerCase().includes(searchTerm)) {
                    return '#ff3366';
                }
                return d.isSolved && state.highlightSolved ? '#FFD700' : '#ffffff';
            })
            .attr('stroke-width', d => {
                if (d.id.toLowerCase().includes(searchTerm)) {
                    return 4;
                }
                return d.isSolved && state.highlightSolved ? 3 : 0.5;
            });

        // Show labels for matching nodes
        d3.selectAll('.node text')
            .style('opacity', d => {
                if (d.id.toLowerCase().includes(searchTerm)) {
                    return 1;
                }
                return state.showLabels ? 0.8 : 0;
            });

        // Find and focus on first match
        const matchingNode = state.nodes.find(n => n.id.toLowerCase().includes(searchTerm));
        if (matchingNode && matchingNode.x && matchingNode.y) {
            const transform = d3.zoomIdentity
                .translate(state.width / 2 - matchingNode.x, state.height / 2 - matchingNode.y)
                .scale(1.5);

            state.svg.transition()
                .duration(750)
                .call(state.zoom.transform, transform);
        }
    }

    searchInput.addEventListener('input', debounce(performSearch, 300));
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Reset view button
    document.getElementById('reset-view').addEventListener('click', function() {
        state.svg.transition()
            .duration(750)
            .call(state.zoom.transform, d3.zoomIdentity);

        if (state.simulation) {
            state.simulation.alpha(0.5).restart();
        }
    });

    // Export SVG button
    document.getElementById('export-svg').addEventListener('click', exportSVG);

    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', function() {
        state.svg.transition().duration(300).call(state.zoom.scaleBy, 1.3);
    });

    document.getElementById('zoom-out').addEventListener('click', function() {
        state.svg.transition().duration(300).call(state.zoom.scaleBy, 0.7);
    });

    document.getElementById('zoom-fit').addEventListener('click', function() {
        // Fit all nodes in view
        if (state.nodes.length === 0) return;

        const bounds = {
            minX: d3.min(state.nodes, d => d.x),
            maxX: d3.max(state.nodes, d => d.x),
            minY: d3.min(state.nodes, d => d.y),
            maxY: d3.max(state.nodes, d => d.y)
        };

        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        const midX = (bounds.minX + bounds.maxX) / 2;
        const midY = (bounds.minY + bounds.maxY) / 2;

        const scale = 0.8 / Math.max(width / state.width, height / state.height);
        const transform = d3.zoomIdentity
            .translate(state.width / 2, state.height / 2)
            .scale(scale)
            .translate(-midX, -midY);

        state.svg.transition()
            .duration(750)
            .call(state.zoom.transform, transform);
    });

    // Close info panel button
    document.getElementById('close-info').addEventListener('click', function() {
        state.selectedNode = null;
        showDefaultInfo();
    });
}

// ============================================
// Export Functionality
// ============================================

function exportSVG() {
    const svgElement = document.querySelector('#visualization svg');
    if (!svgElement) return;

    // Clone the SVG
    const clone = svgElement.cloneNode(true);

    // Add styling inline for export
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Serialize and download
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `fro-network-${new Date().toISOString().slice(0, 10)}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================
// Loading & Error States
// ============================================

function showLoading() {
    const visualization = document.getElementById('visualization');
    if (visualization) {
        visualization.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading FRO Network...</div>
            </div>
        `;
    }
}

function hideLoading() {
    // Loading state is replaced by the visualization
}

function showError(message) {
    const visualization = document.getElementById('visualization');
    if (visualization) {
        visualization.innerHTML = `
            <div class="error">
                <div class="error-icon">⚠</div>
                <div class="error-message">Error Loading Data</div>
                <div class="error-detail">${message}</div>
            </div>
        `;
    }
}

// ============================================
// Window Resize Handler
// ============================================

const handleResize = debounce(function() {
    if (state.simulation) {
        const container = document.getElementById("visualization");
        state.width = container.clientWidth || 800;
        state.height = container.clientHeight || 600;

        state.svg
            .attr("viewBox", `0 0 ${state.width} ${state.height}`);

        state.simulation
            .force("center", d3.forceCenter(state.width / 2, state.height / 2))
            .alpha(0.3)
            .restart();
    }
}, 250);

// ============================================
// Initialization
// ============================================

async function init() {
    try {
        await loadData();
        setupControls();
        createVisualization();
        window.addEventListener('resize', handleResize);

        // Click outside to deselect
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.node') && !e.target.closest('.info-panel')) {
                state.selectedNode = null;
                showDefaultInfo();
            }
        });

    } catch (error) {
        console.error('Failed to initialize visualization:', error);
    }
}

// Start the application
window.addEventListener('load', init);
