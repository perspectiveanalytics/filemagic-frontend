import { useState, useMemo } from 'react';
import { Box, IconButton, Input, List, ListItem, ListItemButton, ListItemDecorator, Typography } from '@mui/joy';
import { useColorScheme } from '@mui/joy/styles';
import { Link, useLocation } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { Trans } from '@lingui/react/macro';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useLingui as useLinguiRuntime } from '@lingui/react';
import { useNavigation, type NavItem } from '../config/navigation';
import { useThanks } from '../hooks/useThanks';
import { changeLocale } from '../i18n';

function NavItemRow({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick: () => void }) {
  return (
    <ListItem sx={{ p: 0 }}>
      <ListItemButton
        component={Link}
        to={item.path}
        selected={isActive}
        onClick={onClick}
        sx={{
          borderRadius: 'md',
          py: 0.75,
          px: 1.5,
          fontSize: 'sm',
          transition: 'all 0.2s ease',
          position: 'relative',
          '&.Mui-selected': {
            bgcolor: 'primary.softBg',
            color: 'primary.softColor',
            fontWeight: 500,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '20%',
              bottom: '20%',
              width: 3,
              borderRadius: 4,
              bgcolor: 'primary.plainColor',
            },
            '&:hover': {
              bgcolor: 'primary.softHoverBg',
            },
          },
          '&:hover': {
            bgcolor: 'background.level1',
          },
        }}
      >
        <ListItemDecorator
          sx={{
            color: isActive ? 'primary.plainColor' : 'text.tertiary',
            minInlineSize: '28px',
          }}
        >
          {item.icon}
        </ListItemDecorator>
        {item.label}
      </ListItemButton>
    </ListItem>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const { mode, systemMode, setMode } = useColorScheme();
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const { showThanks, markThanked } = useThanks();
  const { t } = useLingui();
  const { i18n } = useLinguiRuntime();
  const nextLocale = i18n.locale === 'fr' ? 'en' : 'fr';
  const nav = useNavigation();

  const filteredItems = useMemo(() => {
    if (!search.trim()) return null; // null means show categories
    const q = search.toLowerCase().trim();
    return nav.allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    );
  }, [search, nav.allItems]);

  const clearSearch = () => setSearch('');

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{
        width: 240,
        flexShrink: 0,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        bgcolor: 'background.surface',
        borderRight: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      <Box
        component={Link}
        to="/"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 2.5,
          pb: 2,
          textDecoration: 'none',
        }}
      >
        <img src="/favicon.svg" alt="" width={22} height={22} />
        <Typography
          level="title-lg"
          sx={{
            fontWeight: 700,
            color: 'primary.plainColor',
            letterSpacing: '-0.02em',
          }}
        >
          FileMagic
        </Typography>
      </Box>

      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Input
          size="sm"
          placeholder={t`Search tools...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {showThanks && (
        <Box sx={{ px: 1.5, pb: 1 }}>
          <Box
            component="button"
            onClick={markThanked}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              width: '100%',
              px: 1.5,
              py: 1,
              borderRadius: 'md',
              border: '1px solid',
              borderColor: 'danger.outlinedBorder',
              bgcolor: 'danger.softBg',
              color: 'danger.softColor',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'danger.softHoverBg',
              },
            }}
          >
            <FavoriteBorderRoundedIcon sx={{ fontSize: 15 }} />
            <Typography level="body-xs" sx={{ color: 'inherit', fontWeight: 600 }}>
              <Trans>Say thanks</Trans>
            </Typography>
          </Box>
        </Box>
      )}

      {filteredItems !== null ? (
        /* Search results — flat list */
        <List size="sm" sx={{ px: 1.5, gap: 0.25 }}>
          {filteredItems.map((item) => (
            <NavItemRow
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
              onClick={clearSearch}
            />
          ))}
          {filteredItems.length === 0 && (
            <Typography level="body-xs" sx={{ color: 'text.tertiary', px: 1.5, py: 2, textAlign: 'center' }}>
              <Trans>No tools found</Trans>
            </Typography>
          )}
        </List>
      ) : (
        /* Categories view */
        <Box sx={{ px: 1.5 }}>
          <List size="sm" sx={{ gap: 0.25, pb: 0.5 }}>
            <NavItemRow
              item={nav.homeItem}
              isActive={location.pathname === nav.homeItem.path}
              onClick={clearSearch}
            />
          </List>

          {nav.categories.map((cat) => (
            <Box key={cat.id} sx={{ mb: 0.5 }}>
              <Typography
                level="body-xs"
                sx={{
                  px: 1.5,
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
                  <NavItemRow
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                    onClick={clearSearch}
                  />
                ))}
              </List>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ flex: 1 }} />

      <Box sx={{ px: 2, pb: 2, pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          component={Link}
          to="/security"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 1,
            borderRadius: 'md',
            textDecoration: 'none',
            color: 'primary.plainColor',
            bgcolor: 'primary.softBg',
            border: '1px solid',
            borderColor: 'primary.outlinedBorder',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'primary.softHoverBg',
              '& .sidebar-security-arrow': {
                transform: 'translateX(2px)',
              },
            },
          }}
        >
          <ShieldOutlinedIcon sx={{ fontSize: 15 }} />
          <Typography level="body-xs" sx={{ color: 'inherit', fontWeight: 600 }}>
            <Trans>How it works</Trans>
          </Typography>
          <ArrowForwardIcon
            className="sidebar-security-arrow"
            sx={{ fontSize: 12, ml: 'auto', transition: 'transform 0.2s ease' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
            <Typography
              component={Link}
              to="/privacy"
              level="body-xs"
              sx={{ color: 'text.tertiary', textDecoration: 'none', transition: 'color 0.15s', '&:hover': { color: 'text.secondary' } }}
            >
              <Trans>Privacy</Trans>
            </Typography>
            <Typography
              component={Link}
              to="/terms"
              level="body-xs"
              sx={{ color: 'text.tertiary', textDecoration: 'none', transition: 'color 0.15s', '&:hover': { color: 'text.secondary' } }}
            >
              <Trans>Terms</Trans>
            </Typography>
            <Typography
              component={Link}
              to="/legal"
              level="body-xs"
              sx={{ color: 'text.tertiary', textDecoration: 'none', transition: 'color 0.15s', '&:hover': { color: 'text.secondary' } }}
            >
              <Trans>Legal</Trans>
            </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>
            <IconButton
              component="a"
              href="https://github.com/perspectiveanalytics/filemagic-backend"
              target="_blank"
              rel="noopener noreferrer"
              variant="plain"
              color="neutral"
              size="sm"
              sx={{ minWidth: 24, minHeight: 24, '--IconButton-size': '24px' }}
              aria-label={t`View source on GitHub`}
            >
              <GitHubIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <IconButton
              variant="plain"
              color="neutral"
              size="sm"
              onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
              sx={{ minWidth: 24, minHeight: 24, '--IconButton-size': '24px' }}
              aria-label={t`Toggle color mode`}
            >
              {resolvedMode === 'dark'
                ? <LightModeOutlinedIcon sx={{ fontSize: 14 }} />
                : <DarkModeOutlinedIcon sx={{ fontSize: 14 }} />}
            </IconButton>
            <IconButton
              variant="plain"
              color="neutral"
              size="sm"
              onClick={() => changeLocale(nextLocale)}
              aria-label={t`Switch language`}
              sx={{ minWidth: 24, minHeight: 24, '--IconButton-size': '24px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.03em' }}
            >
              {nextLocale.toUpperCase()}
            </IconButton>
        </Box>

      </Box>
    </Box>
  );
}
