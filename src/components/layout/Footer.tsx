import { Box, Typography, IconButton, Tooltip, Stack, alpha } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <LinkedInIcon sx={{ fontSize: 16 }} />, name: 'LinkedIn', url: '#' },
    { icon: <TwitterIcon sx={{ fontSize: 16 }} />, name: 'Twitter', url: '#' },
    { icon: <FacebookIcon sx={{ fontSize: 16 }} />, name: 'Facebook', url: '#' },
    { icon: <LanguageRoundedIcon sx={{ fontSize: 16 }} />, name: 'Website', url: '#' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        minHeight: 48,
        px: 3,
        py: { xs: 2, md: 0 },
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: { xs: 2, md: 0 },
        bgcolor: 'rgba(12, 14, 20, 0.75)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Left Section: Copyright, Phone & Email */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600 }}>
          © {currentYear} WARLOCK GROUPS
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'block' }, width: '1px', height: 12, bgcolor: 'rgba(255,255,255,0.1)' }} />

        <Box
          component="a"
          href="tel:+94717949956"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: '#94A3B8',
            textDecoration: 'none',
            transition: 'color 0.2s',
            '&:hover': { color: '#E6C687' },
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>+94 71 794 99 56</Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'block' }, width: '1px', height: 12, bgcolor: 'rgba(255,255,255,0.1)' }} />

        <Box
          component="a"
          href="mailto:warlockgroups3d@gmail.com"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: '#94A3B8',
            textDecoration: 'none',
            transition: 'color 0.2s',
            '&:hover': { color: '#E6C687' },
          }}
        >
          <EmailRoundedIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>warlockgroups3d@gmail.com</Typography>
        </Box>
      </Box>

      {/* Right Section: Socials */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={0.5}>
          {socialLinks.map((social) => (
            <Tooltip key={social.name} title={social.name} arrow>
              <IconButton
                component="a"
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: 28,
                  height: 28,
                  color: '#64748B',
                  transition: 'all 0.2s',
                  '&:hover': {
                    color: '#F8FAFC',
                    bgcolor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                {social.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;
