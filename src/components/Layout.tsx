import { useState, useMemo, useEffect, useRef } from 'react';
import { Box, IconButton, Input, Typography, Drawer, List, ListItem, ListItemButton, ListItemDecorator } from '@mui/joy';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MaintenanceBanner from './MaintenanceBanner';
import CreditsBanner from './CreditsBanner';
import { renderTurnstile } from '../turnstile';
import { useColorScheme } from '@mui/joy/styles';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import { homeItem, categories, allItems, type NavItem } from '../config/navigation';
import { useThanks } from '../hooks/useThanks';

function MobileNavItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <ListItem sx={{ p: 0 }}>
      <ListItemButton
        component={Link}
        to={item.path}
        selected={isActive}
        onClick={onClick}
        sx={{
          borderRadius: 'md',
          py: 1.25,
          px: 2,
          fontSize: 'sm',
          '&.Mui-selected': {
            bgcolor: 'primary.softBg',
            color: 'primary.softColor',
            fontWeight: 500,
          },
        }}
      >
        <ListItemDecorator
          sx={{
            color: isActive ? 'primary.plainColor' : 'text.tertiary',
            minInlineSize: '32px',
          }}
        >
          {item.icon}
        </ListItemDecorator>
        {item.label}
      </ListItemButton>
    </ListItem>
  );
}

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const location = useLocation();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileInitialized = useRef(false);
  const { mode, systemMode, setMode } = useColorScheme();
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const { showThanks, markThanked } = useThanks();

  const filteredMobileItems = useMemo(() => {
    if (!mobileSearch.trim()) return null; // null means show categories
    const q = mobileSearch.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    );
  }, [mobileSearch]);

  useEffect(() => {
    if (turnstileInitialized.current || !turnstileRef.current) return;

    const init = () => {
      if (window.turnstile && turnstileRef.current) {
        renderTurnstile(turnstileRef.current);
        turnstileInitialized.current = true;
      }
    };

    if (window.turnstile) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          init();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setMobileSearch('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.body' }}>
      <MaintenanceBanner />
      <CreditsBanner />
      <Box sx={{ display: 'flex', flex: 1 }}>
      <div ref={turnstileRef} style={{ position: 'absolute', zIndex: -1 }} />
      <Sidebar />

      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          bgcolor: 'background.surface',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            textDecoration: 'none',
          }}
        >
          <img src="/favicon.svg" alt="" width={20} height={20} />
          <Typography
            level="title-md"
            sx={{
              fontWeight: 700,
              color: 'primary.plainColor',
              letterSpacing: '-0.02em',
            }}
          >
            FileMagic
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showThanks && (
            <IconButton
              variant="plain"
              color="danger"
              size="sm"
              onClick={markThanked}
              aria-label="Say thanks"
            >
              <FavoriteBorderRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
          <IconButton
            component="a"
            href="https://github.com/perspectiveanalytics/filemagic-backend"
            target="_blank"
            rel="noopener noreferrer"
            variant="plain"
            color="neutral"
            size="sm"
            aria-label="View source on GitHub"
          >
            <GitHubIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton
            variant="plain"
            color="neutral"
            size="sm"
            onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle color mode"
          >
            {resolvedMode === 'dark'
              ? <LightModeOutlinedIcon sx={{ fontSize: 20 }} />
              : <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />}
          </IconButton>
          <IconButton
            variant="plain"
            color="neutral"
            onClick={() => setDrawerOpen(true)}
            size="sm"
          >
            <MenuOutlinedIcon />
          </IconButton>
        </Box>
      </Box>

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        anchor="right"
        size="sm"
        slotProps={{
          content: {
            sx: {
              bgcolor: 'background.surface',
              width: 260,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5 }}>
          <IconButton
            variant="plain"
            color="neutral"
            onClick={closeDrawer}
            size="sm"
          >
            <CloseOutlinedIcon />
          </IconButton>
        </Box>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Input
            size="sm"
            placeholder="Search tools..."
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            startDecorator={<SearchOutlinedIcon sx={{ fontSize: 16, color: 'text.tertiary' }} />}
            sx={{
              '--Input-focusedThickness': '1px',
              fontSize: 'xs',
              bgcolor: 'background.level1',
              borderColor: 'transparent',
              '&:hover': { borderColor: 'neutral.outlinedHoverBorder' },
            }}
          />
        </Box>

        {filteredMobileItems !== null ? (
          /* Search results — flat list */
          <List size="sm" sx={{ px: 1.5, gap: 0.25 }}>
            {filteredMobileItems.map((item) => (
              <MobileNavItem
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                onClick={closeDrawer}
              />
            ))}
            {filteredMobileItems.length === 0 && (
              <Typography level="body-xs" sx={{ color: 'text.tertiary', px: 2, py: 2, textAlign: 'center' }}>
                No tools found
              </Typography>
            )}
          </List>
        ) : (
          /* Categories view */
          <Box sx={{ px: 1.5 }}>
            <List size="sm" sx={{ gap: 0.25, pb: 0.5 }}>
              <MobileNavItem
                item={homeItem}
                isActive={location.pathname === homeItem.path}
                onClick={closeDrawer}
              />
            </List>

            {categories.map((cat) => (
              <Box key={cat.id} sx={{ mb: 0.5 }}>
                <Typography
                  level="body-xs"
                  sx={{
                    px: 2,
                    pt: 1.25,
                    pb: 0.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'text.tertiary',
                    fontSize: '0.65rem',
                  }}
                >
                  {cat.label}
                </Typography>
                <List size="sm" sx={{ gap: 0.25 }}>
                  {cat.items.map((item) => (
                    <MobileNavItem
                      key={item.path}
                      item={item}
                      isActive={location.pathname === item.path}
                      onClick={closeDrawer}
                    />
                  ))}
                </List>
              </Box>
            ))}
          </Box>
        )}
      </Drawer>

      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          '&:focus': {
            position: 'fixed',
            top: 8,
            left: 8,
            width: 'auto',
            height: 'auto',
            overflow: 'visible',
            zIndex: 9999,
            px: 2,
            py: 1,
            bgcolor: 'primary.500',
            color: 'white',
            borderRadius: 'md',
            fontSize: 'sm',
            fontWeight: 600,
            textDecoration: 'none',
          },
        }}
      >
        Skip to main content
      </Box>
      <Box
        component="main"
        id="main-content"
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          px: { xs: 2.5, md: 5 },
          py: { xs: 2, md: 3 },
          pt: { xs: 8, md: 3 },
        }}
      >
        <Outlet />
      </Box>
      </Box>
      <CreditsBanner position="bottom" />
    </Box>
  );
}
