import { Card, Group, ThemeIcon, Text, Title } from "@mantine/core";

interface Props {
  title: string;
  icon: React.ReactNode;
  value: string;
}

const DashboardCard = ({ title, icon, value }: Props) => {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed" tt="uppercase" fw={600}>
          {title}
        </Text>

        <ThemeIcon size="sm" variant="light">
          {icon}
        </ThemeIcon>
      </Group>

      <Title order={3}>{value}</Title>
    </Card>
  );
};

export default DashboardCard;
