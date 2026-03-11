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
  MultiSelect,
} from "@mantine/core";
import { IconUsers, IconChartBar, IconBuilding } from "@tabler/icons-react";
import { useState } from "react";

//Hooks
import { useGetAnalytics } from "../hooks/API/useAnalytic";

function formatCount(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

const PLATFORM_OPTIONS = [
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
] as const;

export function Dashboard() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "youtube",
    "tiktok",
  ]);

  const analyticsQuery = useGetAnalytics(selectedPlatforms);

  const creatorTotals = analyticsQuery.data?.creatorTotals ?? [];
  const totalFollowers = creatorTotals.reduce(
    (sum: number, c: { followers?: number }) => sum + (c.followers ?? 0),
    0,
  );
  const totalEngagement = creatorTotals.reduce(
    (sum: number, c: { engagement?: number }) => sum + (c.engagement ?? 0),
    0,
  );
  const creatorCount = creatorTotals.length;

  const isLoading = analyticsQuery.isLoading || analyticsQuery.isError;

  const handlePlatformChange = (value: string[]) => {
    setSelectedPlatforms((prev) =>
      value.length > 0 ? value : prev,
    );
  };

  const summaryCards = [
    {
      title: "Total followers",
      value: isLoading ? "—" : formatCount(totalFollowers),
      description: "Across all platforms",
      icon: IconUsers,
    },
    {
      title: "Total engagement",
      value: isLoading ? "—" : formatCount(totalEngagement),
      description: "Views / likes across all platforms",
      icon: IconChartBar,
    },
    {
      title: "Creators",
      value: isLoading ? "—" : String(creatorCount),
      description: "In this report",
      icon: IconBuilding,
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Creator campaign analytics
          </Title>
          <Text c="dimmed" size="sm">
            Overview of creators and performance. Data will load from the API.
          </Text>
        </div>

        <Card withBorder padding="lg" radius="md">
          <Text size="sm" fw={600} mb="xs">
            Platforms
          </Text>
          <Text size="xs" c="dimmed" mb="sm">
            Select at least one platform. Data will refresh automatically.
          </Text>
          <MultiSelect
            placeholder="Select platforms"
            data={[...PLATFORM_OPTIONS]}
            value={selectedPlatforms}
            onChange={handlePlatformChange}
          />
        </Card>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          {summaryCards.map((card) => (
            <Card key={card.title} withBorder padding="lg" radius="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" tt="uppercase" fw={600}>
                  {card.title}
                </Text>
                <ThemeIcon size="sm" variant="light">
                  <card.icon size={16} />
                </ThemeIcon>
              </Group>
              <Title order={3}>{card.value}</Title>
              <Text size="xs" c="dimmed" mt={4}>
                {card.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="md">
            Creators
          </Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Platform</Table.Th>
                <Table.Th>Followers</Table.Th>
                <Table.Th>Engagement</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {/* {(creatorsQuery.data?.creators ?? [])?.map((row, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{row.name}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm">
                      {row.platform}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{row.subscriberCount}</Table.Td>
                  <Table.Td>{row.viewCount}</Table.Td>
                </Table.Tr>
              ))} */}
            </Table.Tbody>
          </Table>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="md">
            Performance over time
          </Title>
          <Group
            align="center"
            justify="center"
            bg="var(--mantine-color-gray-0)"
            style={{ minHeight: 200, borderRadius: 4 }}
          >
            <Text size="sm" c="dimmed">
              Chart placeholder — add a visualization when data is ready
            </Text>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}
