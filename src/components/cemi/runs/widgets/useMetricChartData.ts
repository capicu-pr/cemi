import { useMemo } from "react";

interface MetricDataPoint {
  step: number;
  value: number;
  wallTime?: number;
}

interface RunMetricData {
  runId: string;
  runName: string;
  data: MetricDataPoint[];
  color?: string;
}

type ChartPoint = Record<string, number | null> & { step: number };

function smoothData(data: MetricDataPoint[], factor: number): MetricDataPoint[] {
  if (factor === 0 || data.length === 0) return data;

  const smoothed: MetricDataPoint[] = [];
  let last = data[0].value;

  for (const point of data) {
    const smoothedValue = last * factor + point.value * (1 - factor);
    smoothed.push({ ...point, value: smoothedValue });
    last = smoothedValue;
  }

  return smoothed;
}

function downsampleSeries(
  points: MetricDataPoint[],
  maxPoints: number
): MetricDataPoint[] {
  if (points.length <= maxPoints || maxPoints <= 0) return points;
  if (maxPoints < 3) return [points[0], points[points.length - 1]];

  const result: MetricDataPoint[] = [];
  const bucketSize = (points.length - 2) / (maxPoints - 2);
  result.push(points[0]);

  for (let i = 0; i < maxPoints - 2; i++) {
    const bucketStart = 1 + Math.floor(i * bucketSize);
    const bucketEnd = 1 + Math.floor((i + 1) * bucketSize);
    let minPoint = points[bucketStart];
    let maxPoint = points[bucketStart];
    for (let j = bucketStart; j < Math.min(bucketEnd, points.length - 1); j++) {
      if (points[j].value < minPoint.value) minPoint = points[j];
      if (points[j].value > maxPoint.value) maxPoint = points[j];
    }
    if (minPoint.step <= maxPoint.step) {
      result.push(minPoint);
      if (maxPoint.step !== minPoint.step) result.push(maxPoint);
    } else {
      result.push(maxPoint);
      if (minPoint.step !== maxPoint.step) result.push(minPoint);
    }
  }

  result.push(points[points.length - 1]);
  return result
    .sort((a, b) => a.step - b.step)
    .filter((point, idx, arr) => idx === 0 || point.step !== arr[idx - 1].step);
}

export function useMetricChartData(
  runs: RunMetricData[],
  smoothing: number,
  visibleRuns: Set<string>,
  maxPointsPerRun = 400
): { chartData: ChartPoint[] } {
  const chartData = useMemo(() => {
    const processedRuns = runs.map((run) => {
      if (!visibleRuns.has(run.runId)) {
        return { runId: run.runId, points: [] as MetricDataPoint[] };
      }
      const smoothed = smoothData(run.data, smoothing);
      const sampled = downsampleSeries(smoothed, maxPointsPerRun);
      return { runId: run.runId, points: sampled };
    });

    const allSteps = new Set<number>();
    processedRuns.forEach((run) => {
      run.points.forEach((point) => allSteps.add(point.step));
    });
    const sortedSteps = Array.from(allSteps).sort((a, b) => a - b);

    const runStepMaps = new Map<string, Map<number, number>>();
    processedRuns.forEach((run) => {
      runStepMaps.set(
        run.runId,
        new Map(run.points.map((point) => [point.step, point.value]))
      );
    });

    return sortedSteps.map((step) => {
      const point: ChartPoint = { step };
      processedRuns.forEach((run) => {
        if (visibleRuns.has(run.runId)) {
          point[run.runId] = runStepMaps.get(run.runId)?.get(step) ?? null;
        }
      });
      return point;
    });
  }, [runs, smoothing, visibleRuns, maxPointsPerRun]);

  return { chartData };
}

