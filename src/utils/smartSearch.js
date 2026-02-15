/**
 * SmartSearch - Advanced search utility with multiple strategies
 * No AI - Pure algorithmic search with scoring
 */

/**
 * Search strategies
 */
export const SearchStrategies = {
  // Exact match (case insensitive)
  EXACT: 'exact',
  // Contains substring (case insensitive)
  CONTAINS: 'contains',
  // Starts with
  STARTS_WITH: 'startsWith',
  // Word boundary match
  WORD_BOUNDARY: 'wordBoundary',
  // Fuzzy match (typo tolerant)
  FUZZY: 'fuzzy',
  // Numeric range
  RANGE: 'range',
  // Multiple field search
  MULTI_FIELD: 'multiField'
};

/**
 * Normalize text for comparison (remove accents, lowercase)
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim();
};

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
};

/**
 * Calculate similarity score (0-1)
 */
const calculateSimilarity = (str1, str2) => {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return (maxLen - distance) / maxLen;
};

/**
 * Check if query matches using word boundaries
 */
const wordBoundaryMatch = (text, query) => {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  // Split into words and check if query matches any word start
  const words = normalizedText.split(/\s+/);
  return words.some(word => word.startsWith(normalizedQuery));
};

/**
 * Main search function with multiple strategies
 */
export const searchItems = (items, query, options = {}) => {
  const {
    fields = ['name', 'title'],
    strategy = SearchStrategies.MULTI_FIELD,
    threshold = 0.3,
    filters = {},
    sortBy = 'score',
    sortOrder = 'desc'
  } = options;

  if (!query && Object.keys(filters).length === 0) {
    return items.map(item => ({ ...item, _score: 1, _matchedFields: [] }));
  }

  const normalizedQuery = normalizeText(query);

  const results = items.map(item => {
    let score = 0;
    const matchedFields = [];

    // Search in specified fields
    fields.forEach(field => {
      const value = getNestedValue(item, field);
      if (!value) return;

      const normalizedValue = normalizeText(value);
      let fieldScore = 0;

      switch (strategy) {
        case SearchStrategies.EXACT:
          if (normalizedValue === normalizedQuery) {
            fieldScore = 1;
          }
          break;

        case SearchStrategies.CONTAINS:
          if (normalizedValue.includes(normalizedQuery)) {
            fieldScore = normalizedQuery.length / normalizedValue.length;
          }
          break;

        case SearchStrategies.STARTS_WITH:
          if (normalizedValue.startsWith(normalizedQuery)) {
            fieldScore = 0.8 + (0.2 * normalizedQuery.length / normalizedValue.length);
          }
          break;

        case SearchStrategies.WORD_BOUNDARY:
          if (wordBoundaryMatch(value, query)) {
            fieldScore = 0.9;
          }
          break;

        case SearchStrategies.FUZZY:
          fieldScore = calculateSimilarity(normalizedValue, normalizedQuery);
          break;

        case SearchStrategies.MULTI_FIELD:
        default:
          // Combined strategy: exact > startsWith > contains > fuzzy
          if (normalizedValue === normalizedQuery) {
            fieldScore = 1;
          } else if (normalizedValue.startsWith(normalizedQuery)) {
            fieldScore = 0.9;
          } else if (wordBoundaryMatch(value, query)) {
            fieldScore = 0.8;
          } else if (normalizedValue.includes(normalizedQuery)) {
            fieldScore = 0.6;
          } else {
            fieldScore = calculateSimilarity(normalizedValue, normalizedQuery) * 0.5;
          }
      }

      if (fieldScore > 0) {
        score = Math.max(score, fieldScore);
        matchedFields.push({ field, score: fieldScore });
      }
    });

    // Apply additional filters
    let passesFilters = true;
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue === undefined || filterValue === null || filterValue === '') return;
      
      const itemValue = getNestedValue(item, key);
      
      // Handle range filters (min/max price)
      if (key.includes('min') || key.includes('max')) {
        const numValue = parseFloat(itemValue);
        const numFilter = parseFloat(filterValue);
        
        if (key.includes('min') && !isNaN(numValue) && !isNaN(numFilter)) {
          if (numValue < numFilter) passesFilters = false;
        }
        if (key.includes('max') && !isNaN(numValue) && !isNaN(numFilter)) {
          if (numValue > numFilter) passesFilters = false;
        }
      }
      // Handle exact match filters
      else if (normalizeText(itemValue) !== normalizeText(filterValue)) {
        passesFilters = false;
      }
    });

    return {
      ...item,
      _score: passesFilters ? score : 0,
      _matchedFields: matchedFields,
      _passesFilters: passesFilters
    };
  });

  // Filter by threshold and passing filters
  let filtered = results.filter(item => 
    item._passesFilters !== false && (item._score >= threshold || (!query && item._passesFilters))
  );

  // Sort results
  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'score') {
      comparison = b._score - a._score;
    } else {
      const aVal = getNestedValue(a, sortBy);
      const bVal = getNestedValue(b, sortBy);
      comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
    return sortOrder === 'desc' ? comparison : -comparison;
  });

  return filtered;
};

/**
 * Parse search query for advanced filtering
 */
export const parseSearchQuery = (query) => {
  if (!query) return { searchText: '', filters: {} };

  const filters = {};
  let searchText = query;

  // Extract price patterns
  // "under 2M", "less than 3 million", "max 5m"
  const maxPricePattern = /(?:under|less than|max|maximum|below)\s+(\d+(?:\.\d+)?)\s*(m|million|k|kilo)/i;
  const maxPriceMatch = query.match(maxPricePattern);
  if (maxPriceMatch) {
    const value = parseFloat(maxPriceMatch[1]);
    const multiplier = maxPriceMatch[2].toLowerCase().startsWith('m') ? 1000000 : 1000;
    filters.maxPrice = value * multiplier;
    searchText = searchText.replace(maxPriceMatch[0], '');
  }

  // "over 1M", "more than 500k", "min 2m"
  const minPricePattern = /(?:over|more than|min|minimum|above|from)\s+(\d+(?:\.\d+)?)\s*(m|million|k|kilo)/i;
  const minPriceMatch = query.match(minPricePattern);
  if (minPriceMatch) {
    const value = parseFloat(minPriceMatch[1]);
    const multiplier = minPriceMatch[2].toLowerCase().startsWith('m') ? 1000000 : 1000;
    filters.minPrice = value * multiplier;
    searchText = searchText.replace(minPriceMatch[0], '');
  }

  // "1M to 3M", "between 500k and 1M"
  const rangePricePattern = /(\d+(?:\.\d+)?)\s*(m|million|k|kilo)?\s*(?:to|and|-|~)\s*(\d+(?:\.\d+)?)\s*(m|million|k|kilo)/i;
  const rangePriceMatch = query.match(rangePricePattern);
  if (rangePriceMatch) {
    const minVal = parseFloat(rangePriceMatch[1]);
    const maxVal = parseFloat(rangePriceMatch[3]);
    const multiplier = (rangePriceMatch[2] || rangePriceMatch[4] || '').toLowerCase().startsWith('m') ? 1000000 : 1000;
    filters.minPrice = minVal * multiplier;
    filters.maxPrice = maxVal * multiplier;
    searchText = searchText.replace(rangePriceMatch[0], '');
  }

  // Extract bedroom patterns
  // "2 bed", "3 bedroom", "4 rooms", "studio"
  const bedPatterns = [
    { regex: /(\d+)\s*(?:bed|bedroom|br|room|غرفة|غرف)/i, field: 'beds' },
    { regex: /(studio|استوديو)/i, field: 'beds', value: 0 },
    { regex: /(\d+)\s*bhk/i, field: 'beds' },
  ];

  for (const pattern of bedPatterns) {
    const match = query.match(pattern.regex);
    if (match) {
      if (pattern.value !== undefined) {
        filters.beds = pattern.value;
      } else {
        filters.beds = parseInt(match[1]);
      }
      searchText = searchText.replace(match[0], '');
      break;
    }
  }

  // Extract bathroom patterns
  const bathPattern = /(\d+)\s*(?:bath|bathroom|ba|حمام)/i;
  const bathMatch = query.match(bathPattern);
  if (bathMatch) {
    filters.bathrooms = parseInt(bathMatch[1]);
    searchText = searchText.replace(bathMatch[0], '');
  }

  // Extract location patterns
  const locations = [
    'maadi', 'new cairo', '6 october', 'sheikh zayed', 'nasr city',
    'heliopolis', 'mohandessin', 'dokki', 'zamalek', 'katameya',
    'rehab', 'madinaty', 'shorouk', 'obour', 'fifth settlement',
    'المعادي', 'التجمع', '6 أكتوبر', 'الشيخ زايد', 'مدينة نصر',
    'مصر الجديدة', 'المهندسين', 'الدقي', 'الزمالك', 'الرحاب', 'مدينتي'
  ];

  for (const location of locations) {
    const locationRegex = new RegExp(`\\b${location}\\b`, 'i');
    if (locationRegex.test(query)) {
      filters.location = location;
      searchText = searchText.replace(locationRegex, '');
      break;
    }
  }

  // Extract property types
  const propertyTypes = [
    'apartment', 'villa', 'studio', 'penthouse', 'chalet',
    'duplex', 'townhouse', 'twinhouse', 'office', 'shop',
    'شقة', 'فيلا', 'ستوديو', 'بنتهاوس', 'شاليه',
    'دوبلكس', 'تاون هاوس', 'توين هاوس'
  ];

  for (const type of propertyTypes) {
    const typeRegex = new RegExp(`\\b${type}\\b`, 'i');
    if (typeRegex.test(query)) {
      filters.type = type.toLowerCase();
      searchText = searchText.replace(typeRegex, '');
      break;
    }
  }

  // Clean up search text
  searchText = searchText.trim().replace(/\s+/g, ' ');

  return {
    searchText,
    filters,
    originalQuery: query
  };
};

/**
 * Helper to get nested object values
 */
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Group results by field
 */
export const groupResults = (results, field) => {
  const groups = {};
  results.forEach(item => {
    const value = getNestedValue(item, field);
    const key = value || 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
};

/**
 * Get unique values from a field
 */
export const getUniqueValues = (items, field) => {
  const values = new Set();
  items.forEach(item => {
    const value = getNestedValue(item, field);
    if (value !== undefined && value !== null) {
      values.add(value);
    }
  });
  return Array.from(values).sort();
};

/**
 * Create search index for faster searching
 */
export const createSearchIndex = (items, fields) => {
  const index = new Map();
  
  items.forEach((item, idx) => {
    fields.forEach(field => {
      const value = getNestedValue(item, field);
      if (value) {
        const words = normalizeText(value).split(/\s+/);
        words.forEach(word => {
          if (!index.has(word)) {
            index.set(word, new Set());
          }
          index.get(word).add(idx);
        });
      }
    });
  });

  return {
    items,
    index,
    search: (query) => {
      const normalizedQuery = normalizeText(query);
      const queryWords = normalizedQuery.split(/\s+/);
      const matches = new Set();

      queryWords.forEach(word => {
        index.forEach((itemIndices, indexWord) => {
          if (indexWord.includes(word) || word.includes(indexWord)) {
            itemIndices.forEach(idx => matches.add(idx));
          }
        });
      });

      return Array.from(matches).map(idx => items[idx]);
    }
  };
};

export default {
  SearchStrategies,
  searchItems,
  parseSearchQuery,
  groupResults,
  getUniqueValues,
  createSearchIndex
};