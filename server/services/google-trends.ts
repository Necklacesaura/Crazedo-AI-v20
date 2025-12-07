import googleTrends from 'google-trends-api';

interface InterestData {
  date: string;
  value: number;
}

interface RegionData {
  region: string;
  value: number;
}

interface TrendData {
  interest_over_time: InterestData[];
  related_queries: string[];
  interest_by_region: RegionData[];
}

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 3600 * 1000;

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchInterestOverTime(keyword: string): Promise<InterestData[]> {
  const cacheKey = `interest_${keyword}`;
  const cached = getCached<InterestData[]>(cacheKey);
  if (cached) return cached;

  try {
    const results = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(),
    });

    const data = JSON.parse(results);
    if (!data.default?.timelineData?.length) {
      return [];
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData: Record<string, number[]> = {};

    for (const point of data.default.timelineData) {
      const date = new Date(point.time * 1000);
      const dayName = dayNames[date.getDay()];
      if (!dailyData[dayName]) dailyData[dayName] = [];
      dailyData[dayName].push(point.value[0]);
    }

    const today = new Date().getDay();
    const orderedDays: string[] = [];
    for (let i = 6; i >= 0; i--) {
      orderedDays.push(dayNames[(today - i + 7) % 7]);
    }

    const interestData: InterestData[] = [];
    for (const day of orderedDays) {
      if (dailyData[day]?.length) {
        interestData.push({
          date: day,
          value: Math.round(dailyData[day].reduce((a, b) => a + b, 0) / dailyData[day].length)
        });
      }
    }

    if (interestData.length > 0) {
      setCache(cacheKey, interestData);
    }
    return interestData;
  } catch (error) {
    console.error(`[GoogleTrends] Interest over time error for "${keyword}":`, error);
    return [];
  }
}

async function fetchRelatedQueries(keyword: string): Promise<string[]> {
  const cacheKey = `related_${keyword}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const results = await googleTrends.relatedQueries({ keyword });
    const data = JSON.parse(results);
    
    const queries: string[] = [];
    const topQueries = data.default?.rankedList?.[0]?.rankedKeyword;
    
    if (topQueries?.length) {
      for (const item of topQueries.slice(0, 8)) {
        queries.push(item.query);
      }
    }

    if (queries.length > 0) {
      setCache(cacheKey, queries);
      return queries;
    }
    return [`${keyword} news`, `what is ${keyword}`, `${keyword} 2025`, `best ${keyword}`];
  } catch (error) {
    console.error(`[GoogleTrends] Related queries error for "${keyword}":`, error);
    return [`${keyword} news`, `what is ${keyword}`, `${keyword} 2025`, `best ${keyword}`];
  }
}

async function fetchInterestByRegion(keyword: string): Promise<RegionData[]> {
  const cacheKey = `regions_${keyword}`;
  const cached = getCached<RegionData[]>(cacheKey);
  if (cached) return cached;

  try {
    const results = await googleTrends.interestByRegion({
      keyword,
      resolution: 'COUNTRY',
    });
    const data = JSON.parse(results);
    
    if (!data.default?.geoMapData?.length) {
      return [];
    }

    const regions: RegionData[] = data.default.geoMapData
      .sort((a: any, b: any) => (b.value[0] || 0) - (a.value[0] || 0))
      .slice(0, 10)
      .map((item: any) => ({
        region: item.geoName,
        value: item.value[0] || 0
      }));

    if (regions.length > 0) {
      setCache(cacheKey, regions);
    }
    return regions;
  } catch (error) {
    console.error(`[GoogleTrends] Interest by region error for "${keyword}":`, error);
    return [];
  }
}

export async function fetchGoogleTrendsData(keyword: string): Promise<TrendData> {
  console.log(`[GoogleTrends] Fetching data for "${keyword}"...`);
  
  const [interest_over_time, related_queries, interest_by_region] = await Promise.all([
    fetchInterestOverTime(keyword),
    fetchRelatedQueries(keyword),
    fetchInterestByRegion(keyword)
  ]);

  console.log(`[GoogleTrends] Fetched data for "${keyword}": ${interest_over_time.length} interest points, ${related_queries.length} queries, ${interest_by_region.length} regions`);

  return {
    interest_over_time,
    related_queries,
    interest_by_region
  };
}
