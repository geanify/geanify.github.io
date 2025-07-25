import { useState } from 'react'
import { 
  MantineProvider, 
  AppShell, 
  Text, 
  Group,
  Button,
  Card,
  Badge,
  Progress,
  Stack,
  Title,
  ActionIcon,
  Avatar,
  ThemeIcon,
  SimpleGrid
} from '@mantine/core'
import { 
  IconDeviceGamepad2, 
  IconServer, 
  IconUsers, 
  IconChartBar,
  IconSettings,
  IconBell,
  IconMenu2
} from '@tabler/icons-react'

function App() {
  const [opened, setOpened] = useState(false)
  const [stats] = useState({
    totalServers: 1247,
    onlineServers: 1198,
    totalPlayers: 15432,
    uptime: 99.97
  })

  const gameServerData = [
    { name: 'Epic Survival', game: 'Minecraft', players: 45, maxPlayers: 100, status: 'online' },
    { name: 'Dust2 24/7', game: 'CS 1.6', players: 32, maxPlayers: 32, status: 'online' },
    { name: 'TF2 Community', game: 'TF2', players: 0, maxPlayers: 24, status: 'maintenance' }
  ]

  const theme = {
    colorScheme: 'dark',
    colors: {
      dark: [
        '#d5d7e0',
        '#acaebf',
        '#8c8fa3',
        '#666980',
        '#4d4f66',
        '#34354a',
        '#2b2c3d',
        '#1d1e30',
        '#0c0d21',
        '#01010a',
      ],
      gaming: [
        '#ffd32a',
        '#ffc048',
        '#f53b57',
        '#ef5777',
        '#3c40c6',
        '#575fcf',
        '#05c46b',
        '#0be881',
        '#ff3f34',
        '#ff5e57'
      ]
    },
    primaryColor: 'gaming',
    primaryShade: 2
  }

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <AppShell
        padding="md"
        navbar={{
          width: { base: 250 },
          breakpoint: 'sm',
          collapsed: { mobile: !opened }
        }}
        header={{ height: 60 }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <ActionIcon
                size="lg"
                onClick={() => setOpened((o) => !o)}
                hiddenFrom="sm"
              >
                <IconMenu2 size={18} />
              </ActionIcon>
              <Title order={3}>🎮 Gaming Dashboard</Title>
            </Group>
            
            <Group>
              <ActionIcon size="lg">
                <IconBell size={18} />
              </ActionIcon>
              <Avatar size="sm" color="blue">GP</Avatar>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Group mb="md">
            <ThemeIcon size="lg" variant="gradient" gradient={{ from: 'orange', to: 'red' }}>
              <IconDeviceGamepad2 size={20} />
            </ThemeIcon>
            <Text fw={700} size="lg">GameServers Pro</Text>
          </Group>
          
          <Stack gap="xs">
            <Button variant="light" leftSection={<IconChartBar size={16} />} justify="start" fullWidth>
              Dashboard
            </Button>
            <Button variant="subtle" leftSection={<IconServer size={16} />} justify="start" fullWidth>
              Servers
            </Button>
            <Button variant="subtle" leftSection={<IconUsers size={16} />} justify="start" fullWidth>
              Players
            </Button>
            <Button variant="subtle" leftSection={<IconSettings size={16} />} justify="start" fullWidth>
              Settings
            </Button>
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main>
          <Stack gap="lg">
            {/* Stats Cards */}
            <SimpleGrid cols={4} spacing="md" breakpoints={[{ maxWidth: 'sm', cols: 2 }]}>
              <Card shadow="sm" p="lg">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500} c="dimmed">Total Servers</Text>
                    <Text size="xl" fw={700}>{stats.totalServers.toLocaleString()}</Text>
                  </div>
                  <ThemeIcon size="xl" color="blue" variant="light">
                    <IconServer size={24} />
                  </ThemeIcon>
                </Group>
              </Card>

              <Card shadow="sm" p="lg">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500} c="dimmed">Online Servers</Text>
                    <Text size="xl" fw={700} c="green">{stats.onlineServers.toLocaleString()}</Text>
                  </div>
                  <ThemeIcon size="xl" color="green" variant="light">
                    <IconChartBar size={24} />
                  </ThemeIcon>
                </Group>
              </Card>

              <Card shadow="sm" p="lg">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500} c="dimmed">Active Players</Text>
                    <Text size="xl" fw={700} c="orange">{stats.totalPlayers.toLocaleString()}</Text>
                  </div>
                  <ThemeIcon size="xl" color="orange" variant="light">
                    <IconUsers size={24} />
                  </ThemeIcon>
                </Group>
              </Card>

              <Card shadow="sm" p="lg">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500} c="dimmed">Uptime</Text>
                    <Text size="xl" fw={700} c="teal">{stats.uptime}%</Text>
                  </div>
                  <ThemeIcon size="xl" color="teal" variant="light">
                    <IconDeviceGamepad2 size={24} />
                  </ThemeIcon>
                </Group>
              </Card>
            </SimpleGrid>

            {/* Server Status */}
            <Card shadow="sm" p="lg">
              <Title order={4} mb="md">Recent Game Servers</Title>
              <Stack gap="md">
                {gameServerData.map((server, index) => (
                  <Card key={index} shadow="xs" p="md" withBorder>
                    <Group justify="space-between">
                      <Group>
                        <ThemeIcon 
                          size="lg" 
                          color={server.game === 'Minecraft' ? 'green' : server.game === 'CS 1.6' ? 'orange' : 'red'}
                          variant="light"
                        >
                          <IconDeviceGamepad2 size={20} />
                        </ThemeIcon>
                        <div>
                          <Text fw={500}>{server.name}</Text>
                          <Text size="sm" c="dimmed">{server.game}</Text>
                        </div>
                      </Group>
                      
                      <Group>
                        <Badge 
                          color={server.status === 'online' ? 'green' : 'orange'}
                          variant="light"
                        >
                          {server.status}
                        </Badge>
                        <Text size="sm" c="dimmed">
                          {server.players}/{server.maxPlayers} players
                        </Text>
                        <Progress 
                          value={(server.players / server.maxPlayers) * 100} 
                          size="sm" 
                          style={{ width: 100 }}
                          color={server.status === 'online' ? 'green' : 'orange'}
                        />
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Card>
          </Stack>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  )
}

export default App
