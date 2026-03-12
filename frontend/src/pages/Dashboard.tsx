import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Table,
  Group,
  Stack,
  ThemeIcon,
  Badge,
  Box,
  TextInput,
  MultiSelect,
} from "@mantine/core";
import { BarChart } from "@mantine/charts";
import {
  IconEye,
  IconVideo,
  IconUsers,
  IconChartBar,
  IconTrophy,
  IconClock,
  IconBrandYoutube,
  IconBrandTiktok,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import { useState, useMemo, useEffect } from "react";

//Components
import DashboardCard from "../components/Card";

//Hooks
import { useGetCreators } from "../hooks/API/useCreator";
import { useGetAnalytics } from "../hooks/API/useAnalytic";

//Utils
import { formatCount } from "../utils/number";
import { formatDate } from "../utils/date";

const Dashboard = () => {
  const [filters, setFilters] = useState<{
    creatorIds: number[];
    platforms: string[];
    startDate: string | null;
    endDate: string | null;
  }>({
    creatorIds: [],
    platforms: ["youtube", "tiktok"],
    startDate: null,
    endDate: null,
  });

  const [sortConfig, setSortConfig] = useState<{
    column: SortColumn;
    direction: "asc" | "desc";
  }>({ column: "totalViews", direction: "desc" });

  const creatorsQuery = useGetCreators({
    platforms: filters.platforms,
  });

  const anaylyticsQuery = useGetAnalytics({
    startDate: filters.startDate,
    endDate: filters.endDate,
    creatorIds: filters.creatorIds.map((id) => Number(id)),
    platforms: filters.platforms,
  });

  type SortColumn = "totalViews" | "avgViewsPerVideo";

  useEffect(() => {
    if (
      creatorsQuery.isSuccess &&
      creatorsQuery.data != null &&
      creatorsQuery.data.length > 0 &&
      filters.creatorIds.length === 0
    ) {
      setFilters({
        ...filters,
        creatorIds: creatorsQuery.data.map((c) => c.id),
      });
    } else {
      const newCreatorIds = filters.creatorIds.filter((creatorId) =>
        creatorsQuery?.data?.some((c) => c.id === creatorId),
      );

      setFilters({ ...filters, creatorIds: newCreatorIds });
    }
  }, [creatorsQuery.data, creatorsQuery.isSuccess]);

  const barChartData = useMemo(() => {
    return (anaylyticsQuery?.data?.byCreator ?? []).reduce(
      (acc: any, cur: any) => {
        let data: { [key: string]: number } = { creator: cur.creatorName };

        cur.byPlatform.forEach((p: any) => {
          data[p.platform] = p.avgViewsPerVideo;
        });

        return [...acc, data];
      },
      [],
    );
  }, [anaylyticsQuery?.data?.byCreator]);

  const { creatorIds, platforms, startDate, endDate } = filters;
  const { column, direction } = sortConfig;

  const sortedCreatorRanking = useMemo(() => {
    const list = anaylyticsQuery?.data?.byCreator ?? [];
    const dir = direction === "asc" ? 1 : -1;
    return [...list].sort((a: any, b: any) => {
      const aVal = Number(a[column]) ?? 0;
      const bVal = Number(b[column]) ?? 0;
      return (aVal - bVal) * dir;
    });
  }, [anaylyticsQuery?.data?.byCreator, column, direction]);

  const handleCreatorsChange = (value: string[]) => {
    if (value.length === 0) {
      return;
    }

    setFilters({ ...filters, creatorIds: value.map((id) => Number(id)) });
  };

  const handlePlatformsChange = (value: string[]) => {
    if (value.length === 0) {
      return;
    }

    setFilters({ ...filters, platforms: value });
  };

  const handleSort = (newColumn: SortColumn) => {
    if (newColumn === column) {
      setSortConfig({
        column,
        direction: direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({
        column: newColumn,
        direction: "desc",
      });
    }
  };

  const handleClearDates = (): void => {
    setFilters({ ...filters, startDate: null, endDate: null });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Creator Campaign Analytics
          </Title>
          <Text c="dimmed" size="sm">
            Aggregated metrics from videos
          </Text>
        </div>

        <Box>
          <Group gap="md" align="flex-end" wrap="wrap">
            <Stack gap={0}>
              <MultiSelect
                label="Creators"
                placeholder={creatorsQuery.isLoading ? "Loading…" : ""}
                data={(creatorsQuery?.data ?? []).map((creator) => ({
                  value: creator.id.toString(),
                  label: creator.name,
                }))}
                value={creatorIds.map((id) => id.toString())}
                onChange={handleCreatorsChange}
                size="sm"
                disabled={creatorsQuery.isLoading}
                checkIconPosition="right"
              />
              <Text size="xs" c="dimmed" mt={4}>
                Select at least one creator
              </Text>
            </Stack>

            <Stack gap={0}>
              <MultiSelect
                label="Platforms"
                data={[
                  { value: "youtube", label: "YouTube" },
                  { value: "tiktok", label: "TikTok" },
                ]}
                value={platforms}
                onChange={handlePlatformsChange}
                size="sm"
                checkIconPosition="right"
              />
              <Text size="xs" c="dimmed" mt={4}>
                Select at least one creator
              </Text>
            </Stack>

            <Stack gap={0}>
              <Group gap="sm" align="flex-end">
                <TextInput
                  type="date"
                  label="Start date"
                  value={startDate ?? ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      startDate: e.target.value ? e.target.value : null,
                    })
                  }
                  size="sm"
                />
                <TextInput
                  type="date"
                  label="End date"
                  value={endDate ?? ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      endDate: e.target.value ? e.target.value : null,
                    })
                  }
                  size="sm"
                />
              </Group>

              <Text size="xs" c="dimmed" mt={4}>
                Filter analytics by video publish date. Leave empty for all
                time.
              </Text>
            </Stack>
          </Group>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          <DashboardCard
            title="Total views"
            icon={<IconEye size={16} />}
            value={formatCount(anaylyticsQuery?.data?.summary?.totalViews ?? 0)}
          />

          <DashboardCard
            title="Total videos"
            icon={<IconVideo size={16} />}
            value={formatCount(
              anaylyticsQuery?.data?.summary?.totalVideos ?? 0,
            )}
          />

          <DashboardCard
            title="Creators"
            icon={<IconUsers size={16} />}
            value={formatCount(
              anaylyticsQuery?.data?.summary?.creatorCount ?? 0,
            )}
          />

          <DashboardCard
            title="Avg views / video"
            icon={<IconChartBar size={16} />}
            value={formatCount(
              anaylyticsQuery?.data?.summary?.avgViewsPerVideo ?? 0,
            )}
          />
        </SimpleGrid>

        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="md">
            Views by platform
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {anaylyticsQuery?.data?.byPlatform?.map((p: any) => (
              <Card key={p.platform} withBorder padding="md" radius="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon size="lg">
                      {p.platform === "youtube" ? (
                        <IconBrandYoutube size={20} />
                      ) : (
                        <IconBrandTiktok size={20} />
                      )}
                    </ThemeIcon>
                    <div>
                      <Text fw={600} tt="capitalize">
                        {p.platform}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {p.videoCount} videos
                      </Text>
                    </div>
                  </Group>
                  <Text fw={700}>{formatCount(p.views)}</Text>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="md">
            Creator ranking
          </Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Creator</Table.Th>
                <Table.Th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("totalViews")}
                  role="button"
                >
                  <Group gap={4} display="inline-flex">
                    Total views
                    {column === "totalViews" ? (
                      direction === "desc" ? (
                        <IconChevronDown size={14} />
                      ) : (
                        <IconChevronUp size={14} />
                      )
                    ) : (
                      <IconChevronDown size={14} style={{ opacity: 0.4 }} />
                    )}
                  </Group>
                </Table.Th>
                <Table.Th>Videos</Table.Th>
                <Table.Th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("avgViewsPerVideo")}
                  role="button"
                >
                  <Group gap={4} display="inline-flex">
                    Avg views/video
                    {column === "avgViewsPerVideo" ? (
                      direction === "desc" ? (
                        <IconChevronDown size={14} />
                      ) : (
                        <IconChevronUp size={14} />
                      )
                    ) : (
                      <IconChevronDown size={14} style={{ opacity: 0.4 }} />
                    )}
                  </Group>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedCreatorRanking.map((row: any) => (
                <Table.Tr key={row.creatorId}>
                  <Table.Td>{row.creatorName}</Table.Td>
                  <Table.Td>{formatCount(row.totalViews)}</Table.Td>
                  <Table.Td>{row.videoCount}</Table.Td>
                  <Table.Td>{formatCount(row.avgViewsPerVideo)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Group mb="md">
            <ThemeIcon size="md">
              <IconTrophy size={18} />
            </ThemeIcon>
            <Title order={4}>Top videos by views</Title>
          </Group>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Creator</Table.Th>
                <Table.Th>Platform</Table.Th>
                <Table.Th>Views</Table.Th>
                <Table.Th>Published</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {anaylyticsQuery?.data?.topVideos?.map((v: any) => (
                <Table.Tr key={v.videoId}>
                  <Table.Td>{v.title}</Table.Td>
                  <Table.Td>{v.creatorName}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm">
                      {v.platform}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatCount(v.views)}</Table.Td>
                  <Table.Td>{formatDate(v.publishedAt)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Group mb="md">
            <ThemeIcon size="md">
              <IconClock size={18} />
            </ThemeIcon>
            <Title order={4}>Average Views/Video by Platform</Title>
          </Group>
          <BarChart
            h={300}
            data={barChartData}
            dataKey="creator"
            series={[{ name: "youtube" }, { name: "tiktok" }]}
            valueFormatter={(value) => formatCount(value)}
          />
        </Card>
      </Stack>
    </Container>
  );
};

export default Dashboard;
