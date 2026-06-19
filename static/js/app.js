// State Management
let allReleases = [];
let filteredReleases = [];
let feedMetadata = { title: '', updated: '' };
let currentFilter = 'all';
let currentSearchQuery = '';

// SVG Progress Ring calculations for Twitter character count
const CIRCUMFERENCE = 2 * Math.PI * 10; // r = 10 -> ~62.83

// DOM Elements
const elements = {
    syncStatusText: document.querySelector('#syncStatus .status-text'),
    syncStatusDot: document.querySelector('#syncStatus .status-dot'),
    refreshBtn: document.getElementById('refreshBtn'),
    refreshIcon: document.querySelector('#refreshBtn svg'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    typeFilters: document.getElementById('typeFilters'),
    statTotalDays: document.getElementById('statTotalDays'),
    statTotalItems: document.getElementById('statTotalItems'),
    statsChartList: document.getElementById('statsChartList'),
    feedTitle: document.getElementById('feedTitle'),
    resultsCount: document.getElementById('resultsCount'),
    feedLoader: document.getElementById('feedLoader'),
    feedError: document.getElementById('feedError'),
    errorMsg: document.getElementById('errorMsg'),
    retryBtn: document.getElementById('retryBtn'),
    feedEmpty: document.getElementById('feedEmpty'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    timelineContainer: document.getElementById('timelineContainer'),
    
    // Modal Elements
    tweetModal: document.getElementById('tweetModal'),
    closeTweetModal: document.getElementById('closeTweetModal'),
    cancelTweetBtn: document.getElementById('cancelTweetBtn'),
    submitTweetBtn: document.getElementById('submitTweetBtn'),
    tweetTextarea: document.getElementById('tweetTextarea'),
    charCount: document.getElementById('charCount'),
    tweetProgressCircle: document.getElementById('tweetProgressCircle'),
    tweetLivePreview: document.getElementById('tweetLivePreview')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Setup Lucide icons
    lucide.createIcons();
    
    // Register events
    elements.refreshBtn.addEventListener('click', () => fetchReleases(true));
    elements.retryBtn.addEventListener('click', () => fetchReleases(true));
    elements.searchInput.addEventListener('input', handleSearchInput);
    elements.clearSearchBtn.addEventListener('click', clearSearch);
    elements.resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Type Filter Delegation
    elements.typeFilters.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        
        // Update active filter chip
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        currentFilter = chip.dataset.type;
        applyFiltersAndSearch();
    });
    
    // Modal events
    elements.closeTweetModal.addEventListener('click', closeTweetComposer);
    elements.cancelTweetBtn.addEventListener('click', closeTweetComposer);
    elements.tweetTextarea.addEventListener('input', handleTweetInput);
    elements.submitTweetBtn.addEventListener('click', publishTweet);
    
    // Close modal on background click
    elements.tweetModal.addEventListener('click', (e) => {
        if (e.target === elements.tweetModal) {
            closeTweetComposer();
        }
    });
    
    // Fetch initial notes
    fetchReleases();
});

// Fetch Release Notes from API
async function fetchReleases(forceRefresh = false) {
    showLoader();
    elements.refreshBtn.disabled = true;
    elements.refreshIcon.classList.add('spinning');
    elements.syncStatusDot.className = 'status-dot orange pulse';
    elements.syncStatusText.textContent = forceRefresh ? 'Refreshing notes...' : 'Loading release notes...';
    
    try {
        const url = `/api/releases${forceRefresh ? '?refresh=true' : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch release notes.');
        }
        
        allReleases = data.entries || [];
        feedMetadata.title = data.title;
        feedMetadata.updated = data.updated;
        
        // Show status
        const lastUpdatedDate = new Date();
        elements.syncStatusDot.className = 'status-dot green';
        elements.syncStatusText.textContent = `Synced: ${lastUpdatedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        // Render view
        applyFiltersAndSearch();
        renderStats();
        
    } catch (error) {
        console.error('Error fetching release notes:', error);
        showError(error.message);
    } finally {
        elements.refreshBtn.disabled = false;
        elements.refreshIcon.classList.remove('spinning');
    }
}

// UI State Toggles
function showLoader() {
    elements.feedLoader.style.display = 'flex';
    elements.feedError.style.display = 'none';
    elements.feedEmpty.style.display = 'none';
    elements.timelineContainer.style.display = 'none';
}

function showError(message) {
    elements.feedLoader.style.display = 'none';
    elements.feedError.style.display = 'flex';
    elements.feedEmpty.style.display = 'none';
    elements.timelineContainer.style.display = 'none';
    elements.errorMsg.textContent = message;
    elements.syncStatusDot.className = 'status-dot orange';
    elements.syncStatusText.textContent = 'Sync failed';
}

function showEmpty() {
    elements.feedLoader.style.display = 'none';
    elements.feedError.style.display = 'none';
    elements.feedEmpty.style.display = 'flex';
    elements.timelineContainer.style.display = 'none';
    elements.resultsCount.textContent = '0 updates';
}

function showContent() {
    elements.feedLoader.style.display = 'none';
    elements.feedError.style.display = 'none';
    elements.feedEmpty.style.display = 'none';
    elements.timelineContainer.style.display = 'block';
}

// Stats & Charts Calculations
function renderStats() {
    // Total Days
    elements.statTotalDays.textContent = allReleases.length;
    
    // Breakdown of Types
    let totalItems = 0;
    const typeCounts = {
        Feature: 0,
        Fix: 0,
        Changed: 0,
        Deprecated: 0,
        Announcement: 0,
        Other: 0
    };
    
    allReleases.forEach(entry => {
        if (entry.items && entry.items.length) {
            entry.items.forEach(item => {
                totalItems++;
                const itemType = item.type;
                if (typeCounts.hasOwnProperty(itemType)) {
                    typeCounts[itemType]++;
                } else if (itemType === 'Update') {
                    typeCounts.Announcement++; // map generic updates to Announcement for style
                } else {
                    typeCounts.Other++;
                }
            });
        }
    });
    
    elements.statTotalItems.textContent = totalItems;
    
    // Sort and render the mini charts in sidebar
    elements.statsChartList.innerHTML = '';
    const activeTypes = Object.entries(typeCounts)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);
        
    activeTypes.forEach(([type, count]) => {
        const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;
        const lowercaseType = type.toLowerCase();
        
        const row = document.createElement('div');
        row.className = 'chart-row';
        row.innerHTML = `
            <div class="chart-label-row">
                <span>${type}</span>
                <span><strong>${count}</strong> (${Math.round(percentage)}%)</span>
            </div>
            <div class="chart-bar-wrapper">
                <div class="chart-bar" style="width: 0%; background-color: var(--type-${lowercaseType === 'other' ? 'update' : lowercaseType})"></div>
            </div>
        `;
        
        elements.statsChartList.appendChild(row);
        
        // Trigger animation
        setTimeout(() => {
            const bar = row.querySelector('.chart-bar');
            if (bar) bar.style.width = `${percentage}%`;
        }, 50);
    });
}

// Search Handler
function handleSearchInput(e) {
    currentSearchQuery = e.target.value.toLowerCase().trim();
    if (currentSearchQuery) {
        elements.clearSearchBtn.style.display = 'block';
    } else {
        elements.clearSearchBtn.style.display = 'none';
    }
    applyFiltersAndSearch();
}

function clearSearch() {
    elements.searchInput.value = '';
    currentSearchQuery = '';
    elements.clearSearchBtn.style.display = 'none';
    applyFiltersAndSearch();
}

function resetFilters() {
    clearSearch();
    currentFilter = 'all';
    document.querySelectorAll('.filter-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.type === 'all');
    });
    applyFiltersAndSearch();
}

// Filter and Search Algorithm
function applyFiltersAndSearch() {
    filteredReleases = [];
    
    allReleases.forEach(entry => {
        const matchingItems = [];
        
        if (entry.items && entry.items.length) {
            entry.items.forEach(item => {
                // Type Filter Check
                let passFilter = false;
                if (currentFilter === 'all') {
                    passFilter = true;
                } else if (currentFilter === 'Announcement') {
                    passFilter = (item.type === 'Announcement' || item.type === 'Update');
                } else {
                    passFilter = (item.type === currentFilter);
                }
                
                // Search Query Check
                let passSearch = true;
                if (currentSearchQuery) {
                    const typeMatches = item.type.toLowerCase().includes(currentSearchQuery);
                    const descMatches = item.description.toLowerCase().includes(currentSearchQuery);
                    const dateMatches = entry.title.toLowerCase().includes(currentSearchQuery);
                    passSearch = typeMatches || descMatches || dateMatches;
                }
                
                if (passFilter && passSearch) {
                    matchingItems.push(item);
                }
            });
        }
        
        // If entry has matching items, construct a filtered entry copy
        if (matchingItems.length > 0) {
            filteredReleases.push({
                ...entry,
                items: matchingItems
            });
        }
    });
    
    renderTimeline();
}

// Render Timeline Content
function renderTimeline() {
    elements.timelineContainer.innerHTML = '';
    
    // Count total items matching
    let totalMatchCount = 0;
    filteredReleases.forEach(e => totalMatchCount += e.items.length);
    
    if (totalMatchCount === 0) {
        showEmpty();
        return;
    }
    
    showContent();
    elements.resultsCount.textContent = `${totalMatchCount} update${totalMatchCount === 1 ? '' : 's'} found`;
    
    filteredReleases.forEach((entry, groupIndex) => {
        const groupEl = document.createElement('div');
        groupEl.className = 'timeline-group';
        
        // Setup Date Group Header
        const dateEl = document.createElement('div');
        dateEl.className = 'timeline-date';
        dateEl.innerHTML = `
            ${entry.title}
            <span>${formatIsoDate(entry.updated)}</span>
        `;
        groupEl.appendChild(dateEl);
        
        // Setup Card List Container
        const cardsEl = document.createElement('div');
        cardsEl.className = 'timeline-cards';
        
        entry.items.forEach((item, itemIndex) => {
            const cardEl = document.createElement('div');
            // Classify by type for custom accents
            const lowercaseType = item.type.toLowerCase();
            const classType = (lowercaseType === 'update') ? 'announcement' : lowercaseType;
            cardEl.className = `release-card ${classType}`;
            
            // Build card header
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';
            
            const badge = document.createElement('span');
            badge.className = `type-badge ${classType}`;
            badge.innerHTML = `<span class="chip-dot ${classType}"></span> ${item.type}`;
            
            const actions = document.createElement('div');
            actions.className = 'card-actions';
            
            // Tweet Share Button
            const tweetBtn = document.createElement('button');
            tweetBtn.className = 'card-action-btn btn-tweet-action';
            tweetBtn.title = 'Tweet about this update';
            tweetBtn.innerHTML = `<i data-lucide="twitter"></i>`;
            tweetBtn.addEventListener('click', () => openTweetComposer(entry, item));
            
            // Link back to original
            const linkBtn = document.createElement('a');
            linkBtn.href = entry.link || 'https://docs.cloud.google.com/bigquery/docs/release-notes';
            linkBtn.target = '_blank';
            linkBtn.className = 'card-action-btn';
            linkBtn.title = 'View official documentation';
            linkBtn.innerHTML = `<i data-lucide="external-link"></i>`;
            
            actions.appendChild(tweetBtn);
            actions.appendChild(linkBtn);
            
            cardHeader.appendChild(badge);
            cardHeader.appendChild(actions);
            
            // Build card body (with highlighted text if search matches)
            const contentEl = document.createElement('div');
            contentEl.className = 'release-content';
            contentEl.innerHTML = highlightMatch(item.description, currentSearchQuery);
            
            cardEl.appendChild(cardHeader);
            cardEl.appendChild(contentEl);
            cardsEl.appendChild(cardEl);
        });
        
        groupEl.appendChild(cardsEl);
        elements.timelineContainer.appendChild(groupEl);
    });
    
    // Refresh newly added icons
    lucide.createIcons();
}

// Highlight Search Matches
function highlightMatch(html, query) {
    if (!query) return html;
    
    // Escape regex characters
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Parse the HTML content temporarily to avoid highlighting tag names or attributes
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const container = doc.querySelector('div');
    
    highlightNode(container, new RegExp(`(${escapedQuery})`, 'gi'));
    
    return container.innerHTML;
}

function highlightNode(node, regex) {
    if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentNode;
        if (parent && parent.nodeName !== 'MARK' && parent.nodeName !== 'CODE' && parent.nodeName !== 'A') {
            const text = node.nodeValue;
            if (regex.test(text)) {
                const tempSpan = document.createElement('span');
                tempSpan.innerHTML = text.replace(regex, '<mark>$1</mark>');
                while (tempSpan.firstChild) {
                    parent.insertBefore(tempSpan.firstChild, node);
                }
                parent.removeChild(node);
            }
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Recurse children backwards so replacement doesn't disrupt traversal
        const children = Array.from(node.childNodes);
        for (let i = children.length - 1; i >= 0; i--) {
            highlightNode(children[i], regex);
        }
    }
}

// Date Formatting helpers
function formatIsoDate(isoStr) {
    if (!isoStr) return '';
    try {
        const date = new Date(isoStr);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
}

// Convert HTML content into clean markdown-flavored plain text
function cleanHtmlForTweet(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    
    // Convert <code> elements to markdown style
    tempDiv.querySelectorAll("code").forEach(code => {
        const content = code.textContent || code.innerText;
        code.textContent = `\`${content}\``;
    });
    
    // Convert links to clean label format
    tempDiv.querySelectorAll("a").forEach(a => {
        const label = a.textContent || a.innerText;
        a.textContent = label;
    });
    
    let text = tempDiv.textContent || tempDiv.innerText || "";
    
    // Clean up excessive whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

// Twitter / X Composer logic
function openTweetComposer(entry, item) {
    const rawText = cleanHtmlForTweet(item.description);
    const dateStr = entry.title;
    const typeStr = item.type;
    const hashtags = " #BigQuery #GoogleCloud";
    
    const prefix = `BigQuery ${typeStr} (${dateStr}): `;
    // Fallback URL if individual entry anchor is unavailable
    const link = item.link || entry.link || "https://docs.cloud.google.com/bigquery/docs/release-notes";
    
    // Generate text composer
    const maxLen = 280;
    
    // Calculate the length limit. Twitter treats links as 23 characters under t.co shortener.
    // However, in our standard textarea we can represent it with its actual URL length for safety.
    const linkPart = ` ${link}`;
    const metaLen = prefix.length + linkPart.length + hashtags.length;
    const maxDescLen = maxLen - metaLen;
    
    let finalDesc = rawText;
    if (rawText.length > maxDescLen) {
        finalDesc = rawText.substring(0, maxDescLen - 3) + "...";
    }
    
    const initialTweetText = `${prefix}${finalDesc}${linkPart}${hashtags}`;
    
    // Load into Modal
    elements.tweetTextarea.value = initialTweetText;
    updateTweetProgress();
    
    // Open Modal with active transition
    elements.tweetModal.classList.add('active');
    elements.tweetTextarea.focus();
}

function closeTweetComposer() {
    elements.tweetModal.classList.remove('active');
}

function handleTweetInput() {
    updateTweetProgress();
}

function updateTweetProgress() {
    const text = elements.tweetTextarea.value;
    const len = text.length;
    
    // Update live preview
    elements.tweetLivePreview.textContent = text;
    
    // Update character limit counter
    const remaining = 280 - len;
    elements.charCount.textContent = remaining;
    
    // Color transitions based on remaining chars
    if (remaining < 0) {
        elements.charCount.style.color = 'var(--type-deprecated)';
        elements.submitTweetBtn.disabled = true;
    } else if (remaining <= 20) {
        elements.charCount.style.color = 'var(--type-changed)';
        elements.submitTweetBtn.disabled = false;
    } else {
        elements.charCount.style.color = 'var(--text-secondary)';
        elements.submitTweetBtn.disabled = false;
    }
    
    // Progress Ring draw
    const fillRatio = Math.min(len / 280, 1);
    const strokeDashoffset = CIRCUMFERENCE - (fillRatio * CIRCUMFERENCE);
    
    elements.tweetProgressCircle.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    elements.tweetProgressCircle.style.strokeDashoffset = strokeDashoffset;
    
    if (remaining < 0) {
        elements.tweetProgressCircle.style.stroke = 'var(--type-deprecated)';
    } else if (remaining <= 20) {
        elements.tweetProgressCircle.style.stroke = 'var(--type-changed)';
    } else {
        elements.tweetProgressCircle.style.stroke = 'var(--twitter-color)';
    }
}

function publishTweet() {
    const text = elements.tweetTextarea.value;
    if (text.length > 280) return;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
    closeTweetComposer();
}
