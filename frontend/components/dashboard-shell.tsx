'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 250;

type NavItem = {
  label: string;
  href: string;
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isTenantRoute = pathname.startsWith('/rentalproperty/dashboard/tenant');
  const primaryNavItems: NavItem[] = [
    { label: isTenantRoute ? 'Tenant Dashboard' : 'Dashboard Home', href: isTenantRoute ? '/rentalproperty/dashboard/tenant' : '/rentalproperty/dashboard' },
  ];

  const propertyMatch = pathname.match(/^\/rentalproperty\/dashboard\/properties\/([^/]+)/);
  const propertyId = propertyMatch?.[1];
  const propertyNavItems: NavItem[] = propertyId
    ? [
        { label: 'Property Overview', href: `/rentalproperty/dashboard/properties/${propertyId}` },
        { label: 'Stays', href: `/rentalproperty/dashboard/properties/${propertyId}/stays` },
        { label: 'Bills', href: `/rentalproperty/dashboard/properties/${propertyId}/bills` },
        { label: 'Complaints', href: `/rentalproperty/dashboard/properties/${propertyId}/complaints` },
      ]
    : [];

  const renderNavItems = (items: NavItem[]) =>
    items.map((item) => {
      const selected = pathname === item.href || pathname.startsWith(`${item.href}/`);
      return (
        <ListItemButton
          key={item.href}
          selected={selected}
          onClick={() => {
            router.push(item.href as any);
            setMobileOpen(false);
          }}
          sx={{ borderRadius: 1.5, mb: 0.5 }}
        >
          <ListItemText primary={item.label} />
        </ListItemButton>
      );
    });

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Rental SaaS
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        <ListItemText
          primary="Main"
          slotProps={{ primary: { variant: 'caption', color: 'text.secondary', sx: { px: 2, pb: 0.5 } } }}
        />
        {renderNavItems(primaryNavItems)}

        {propertyNavItems.length ? (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItemText
              primary="Property"
              slotProps={{ primary: { variant: 'caption', color: 'text.secondary', sx: { px: 2, pb: 0.5 } } }}
            />
            {renderNavItems(propertyNavItems)}
          </>
        ) : null}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
              aria-label="open navigation"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              Control Center
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button component={Link} href="/rentalproperty/dashboard/select-role" variant="text">
              Switch Role
            </Button>
            <Button component={Link} href="/rentalproperty/api/auth/signout" variant="text">
              Sign Out
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
