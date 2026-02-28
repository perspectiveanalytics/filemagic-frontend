import { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Typography, Slider, Checkbox, Switch, Sheet, IconButton, Input, Chip } from '@mui/joy';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SEO, { buildToolSchema } from '../components/SEO';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AbcOutlinedIcon from '@mui/icons-material/AbcOutlined';
import { useLang } from '../hooks/useLang';
import type { Lang } from '../hooks/useLang';

const UPPERCASE = 'BCDEFGHIJKLNOPRSTUVXY';
const LOWERCASE = 'bcdefghijklnoprstuvxy';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?/~';

// Characters that differ in position between QWERTY and AZERTY layouts
const AZERTY_CONFUSED_SYMBOLS = ';:!/.?,<>';

const FULL_UPPERCASE = UPPERCASE + 'AQZWM';
const FULL_LOWERCASE = LOWERCASE + 'aqzwm';

function generateSecurePassword(length: number, pool: string): string {
  if (pool.length === 0) return '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => pool[n % pool.length]).join('');
}

// ---------------------------------------------------------------------------
// EFF short wordlist (1296 words) for passphrase generation
// ---------------------------------------------------------------------------

const WORDLIST = [
  'acid','acorn','acre','acts','afar','affix','aged','agent','agile','aging','agony','ahead','aide','aids','aim','ajar','alarm','alias','alibi','alien',
  'alike','alive','aloe','aloft','aloha','alone','amend','amino','ample','amuse','angel','anger','angle','ankle','apple','april','apron','aqua','area','arena',
  'argue','arise','armed','armor','army','aroma','array','arson','art','ashen','ashes','atlas','atom','attic','audio','avert','avoid','awake','award','awoke',
  'axis','bacon','badge','bagel','baggy','baked','baker','balmy','banjo','barge','barn','bash','basil','bask','batch','bath','baton','bats','blade','blank',
  'blast','blaze','bleak','blend','bless','blimp','blink','bloat','blob','blog','blot','blunt','blurt','blush','boast','boat','body','boil','bolt','boned',
  'bonus','bony','book','booth','boots','boss','botch','both','boxer','breed','bribe','brick','bride','brim','bring','brink','brisk','broad','broil','broke',
  'brook','broom','brush','buck','bud','buggy','bulge','bulk','bully','bunch','bunny','bunt','bush','bust','busy','buzz','cable','cache','cadet','cage',
  'cake','calm','cameo','canal','candy','cane','canon','cape','card','cargo','carol','carry','carve','case','cash','cause','cedar','chain','chair','chant',
  'chaos','charm','chase','cheek','cheer','chef','chess','chest','chew','chief','chili','chill','chip','chomp','chop','chow','chuck','chump','chunk','churn',
  'chute','cider','cinch','city','civic','civil','clad','claim','clamp','clap','clash','clasp','class','claw','clay','clean','clear','cleat','cleft','clerk',
  'click','cling','clink','clip','cloak','clock','clone','cloth','cloud','clump','coach','coast','coat','coil','cola','cold','colt','coma','come','comic',
  'comma','cone','cope','copy','coral','cork','cost','couch','cough','cover','cozy','craft','cramp','crane','crank','crate','crave','crawl','crazy','creme',
  'crepe','crept','crib','cried','crisp','crook','crop','cross','crowd','crown','crumb','crush','crust','cub','cult','cupid','cure','curl','curry','curse',
  'curve','curvy','cushy','cut','cycle','dab','dad','daily','dairy','daisy','dance','dandy','darn','dart','dash','data','date','dawn','deaf','deal',
  'dean','debit','debt','debug','decaf','decal','decay','deck','decor','decoy','deed','delay','denim','dense','dent','depth','derby','desk','dial','diary',
  'dice','dig','dill','dime','dimly','diner','dingy','disco','dish','disk','ditch','dizzy','dock','dodge','doing','doll','dome','donor','donut','dose',
  'dot','dove','down','doze','drab','drama','drank','draw','dress','dried','drift','drill','drive','drone','droop','drove','drown','drum','dry','duck',
  'duct','dude','dug','duke','duo','dusk','dust','duty','dwarf','dwell','eagle','early','earth','easel','east','eaten','eats','ebony','echo','edge',
  'eel','eject','elbow','elder','elf','elk','elm','elope','elude','elves','email','emit','empty','emu','enter','entry','envoy','equal','erase','error',
  'erupt','essay','etch','evade','even','evict','evil','evoke','exact','exit','fable','faced','fact','fade','fall','false','fancy','fang','fax','feast',
  'feed','femur','fence','fend','ferry','fetal','fetch','fever','fiber','fifth','fifty','film','filth','final','finch','fit','five','flag','flaky','flame',
  'flap','flask','fled','flick','fling','flint','flip','flirt','float','flock','flop','floss','flyer','foam','foe','fog','foil','folk','food','fool',
  'found','fox','foyer','frail','frame','fray','fresh','fried','frill','frisk','from','front','frost','froth','frown','froze','fruit','gag','gains','gala',
  'game','gap','gas','gave','gear','gecko','geek','gem','genre','gift','gig','gills','given','giver','glad','glass','glide','gloss','glove','glow',
  'glue','goal','going','golf','gong','good','goofy','gore','gown','grab','grain','grant','grape','graph','grasp','grass','grave','gravy','gray','green',
  'greet','grew','grid','grief','grill','grip','grit','groom','grope','growl','grub','grunt','guide','gulf','gulp','gummy','guru','gush','gut','guy',
  'habit','half','halo','halt','happy','harm','hash','hasty','hatch','hate','haven','hazel','hazy','heap','heat','heave','hedge','hefty','help','herbs',
  'hers','hub','hug','hula','hull','human','humid','hump','hung','hunk','hunt','hurry','hurt','hush','hut','ice','icing','icon','icy','igloo',
  'image','ion','iron','issue','item','ivory','ivy','jab','jam','jaws','jazz','jeep','jelly','jet','jiffy','job','jog','jolly','jolt','jot',
  'joy','judge','juice','juicy','jumbo','jump','juror','jury','keep','keg','kept','kick','kilt','king','kite','kitty','kiwi','knee','knelt','koala',
  'ladle','lady','lair','lake','lance','land','lapel','large','lash','lasso','last','latch','late','lazy','left','legal','lemon','lend','lens','lent',
  'level','lever','lid','life','lift','lilac','lily','limb','limes','line','lint','lion','lip','list','lived','liver','lunar','lunch','lung','lurch',
  'lure','lurk','lying','lyric','mace','maker','malt','mama','mango','manor','many','map','march','marry','mash','match','mate','math','moan','mocha',
  'moist','mold','mom','moody','mop','morse','most','motor','motto','mount','mouse','mouth','move','movie','mower','mud','mug','mulch','mule','mull',
  'mumbo','mummy','mural','muse','music','musky','mute','nacho','nag','nail','name','nanny','nap','navy','near','neat','neon','nerd','nest','net',
  'next','niece','ninth','nutty','oak','oasis','oat','ocean','oil','old','olive','omen','onion','only','ooze','opal','open','opera','opt','otter',
  'ouch','ounce','outer','oval','oven','owl','ozone','pace','pagan','pager','palm','panda','panic','pants','paper','park','party','pasta','patch','path',
  'patio','payer','pecan','penny','pep','perch','perky','perm','pest','petal','petty','photo','plank','plant','plaza','plead','plot','plow','pluck','plug',
  'plus','poach','pod','poem','poet','pogo','point','poise','poker','polar','polka','polo','pond','pony','poppy','pork','poser','pouch','pound','pout',
  'power','prank','press','print','prior','prism','prize','probe','prong','proof','props','prude','prune','pry','pug','pull','pulp','pulse','puma','punch',
  'punk','pupil','puppy','purr','purse','push','putt','quack','quake','query','quiet','quill','quilt','quit','quota','quote','rabid','race','rack','radar',
  'radio','raft','rage','raid','rail','rake','rally','ramp','ranch','range','rank','rant','rash','raven','reach','react','ream','rebel','recap','relax',
  'relay','relic','remix','repay','repel','reply','rerun','reset','rhyme','rice','rich','ride','rigid','rigor','rinse','riot','ripen','rise','risk','rival',
  'river','roast','robe','robin','rock','rogue','romp','rope','rover','royal','ruby','rug','ruin','rule','runny','rush','rust','rut','sadly','sage',
  'said','saint','salad','salon','salsa','salt','same','sandy','santa','satin','sauna','saved','savor','sax','say','scale','scam','scan','scare','scarf',
  'scary','scoff','scold','scoop','scoot','scope','score','scorn','scout','scowl','scrap','scrub','scuba','scuff','sect','sedan','self','send','serve','set',
  'seven','shack','shade','shady','shaft','shaky','sham','shape','share','sharp','shed','sheep','sheet','shelf','shell','shine','shiny','ship','shirt','shock',
  'shop','shore','shout','shove','shown','showy','shred','shrug','shun','shush','shut','shy','sift','silk','silly','silo','sip','siren','sixth','size',
  'skate','skew','skid','skier','skies','skip','skirt','skit','sky','slab','slack','slain','slam','slang','slash','slate','slaw','sled','sleek','sleep',
  'sleet','slept','slice','slick','slimy','sling','slip','slit','slob','slot','slug','slum','slurp','slush','small','smash','smell','smile','smirk','smog',
  'snack','snap','snare','snarl','sneak','sneer','sniff','snore','snort','snout','snowy','snub','snuff','speak','speed','spend','spent','spew','spill','spoil',
  'spoke','spoof','spool','spoon','sport','spot','spout','spray','spree','spur','squad','squat','squid','stack','staff','stage','stain','stall','stamp','stand',
  'stank','stark','start','stash','state','stays','steam','steep','stem','step','stew','stick','sting','stir','stock','stole','stomp','stony','stood','stool',
  'stoop','stop','storm','stout','stove','straw','stray','strut','stuck','stud','stuff','stump','stung','stunt','suds','sugar','sulk','surf','sushi','swab',
  'swan','swarm','sway','swear','sweat','sweep','swell','swept','swim','swing','swipe','swirl','swoop','swore','syrup','tacky','taco','tag','take','tall',
  'talon','tamer','tank','taper','taps','tarot','tart','task','taste','tasty','taunt','thank','thaw','theft','theme','thigh','thing','think','thorn','those',
  'throb','thud','thumb','thump','thus','tiara','tidal','tidy','tiger','tile','tilt','tint','tiny','trace','track','trade','train','trait','trap','trash',
  'tray','treat','tree','trek','trend','trial','tribe','trick','trio','trout','truce','truck','trunk','try','tug','tulip','tummy','turf','tusk','tutor',
  'tutu','tux','tweak','tweet','twice','twine','twins','twirl','twist','uncle','uncut','undo','unify','union','unit','untie','upon','upper','urban','used',
  'user','usher','utter','value','vapor','vegan','venue','verse','vest','veto','vice','video','view','viral','virus','visa','visor','vocal','voice','void',
  'volt','voter','vowel','wad','wafer','wager','wages','wagon','wake','walk','wand','wasp','watch','water','wavy','wheat','whiff','whole','wick','widen',
  'widow','width','wife','wifi','wilt','wimp','wind','wing','wink','wipe','wired','wiry','wise','wish','wispy','wolf','womb','wool','word','work',
  'worry','wound','woven','wrath','wreck','wrist','yard','year','yeast','yelp','yield','yodel','yoga','yummy','zebra','zero','zesty','zippy','zone','zoom',
];

function generatePassphrase(wordCount: number): string {
  const array = new Uint32Array(wordCount + 1); // +1 for the trailing digit
  crypto.getRandomValues(array);
  const words = Array.from({ length: wordCount }, (_, i) => {
    const word = WORDLIST[array[i] % WORDLIST.length];
    return word[0].toUpperCase() + word.slice(1);
  });
  const digit = array[wordCount] % 10;
  return words.join('-') + digit;
}

type GeneratorMode = 'password' | 'passphrase';

function calcEntropy(length: number, poolSize: number): number {
  if (poolSize <= 1) return 0;
  return length * Math.log2(poolSize);
}

type Strength = 'weak' | 'fair' | 'strong' | 'very strong';

function getStrength(entropy: number): Strength {
  if (entropy < 40) return 'weak';
  if (entropy < 60) return 'fair';
  if (entropy < 80) return 'strong';
  return 'very strong';
}

const strengthColors: Record<Strength, string> = {
  weak: 'var(--joy-palette-danger-400)',
  fair: 'var(--joy-palette-warning-400)',
  strong: 'var(--joy-palette-success-400)',
  'very strong': 'var(--joy-palette-success-400)',
};

const strengthWidths: Record<Strength, string> = {
  weak: '25%',
  fair: '50%',
  strong: '75%',
  'very strong': '100%',
};

const BANNER_TEXT = {
  en: {
    title: 'Honest disclaimer',
    body: 'Generating passwords on a website (yes, even this one) isn\'t exactly best practice. For real security, use a dedicated password manager — they generate, store, and auto-fill passwords so you don\'t have to remember anything.',
    responsibility: 'This tool is handy for quick throwaway passwords, but don\'t blame us if you close the tab without copying. Nothing is stored — once it\'s gone, it\'s gone.',
    recommended: 'Recommended',
    guidelines: 'Official guidelines',
  },
  fr: {
    title: 'Avertissement honnête',
    body: 'Générer un mot de passe sur un site web (oui, même celui-ci) n\'est pas exactement une bonne pratique. Pour une vraie sécurité, utilisez un gestionnaire de mots de passe dédié — ils génèrent, stockent et remplissent automatiquement vos mots de passe.',
    responsibility: 'Cet outil est pratique pour un mot de passe rapide, mais ne nous en voulez pas si vous fermez l\'onglet sans le copier. Rien n\'est stocké — une fois perdu, c\'est perdu.',
    recommended: 'Recommandés',
    guidelines: 'Guides officiels',
  },
};

const LANGS: Lang[] = ['en', 'fr'];

const linkSx = {
  color: 'warning.plainColor',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
  fontWeight: 600,
  '&:hover': { opacity: 0.8 },
} as const;

function PasswordBestPracticeBanner() {
  const [lang, setLang] = useLang();
  const t = BANNER_TEXT[lang];

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: 'warning.outlinedBorder',
        bgcolor: 'warning.softBg',
        position: 'relative',
      }}
    >
      <Box
        role="radiogroup"
        aria-label="Banner language"
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'inline-flex',
          borderRadius: '6px',
          bgcolor: 'warning.softActiveBg',
          border: '1px solid',
          borderColor: 'warning.outlinedBorder',
          p: '2px',
        }}
      >
        {LANGS.map((l) => (
          <Box
            key={l}
            component="button"
            role="radio"
            aria-checked={lang === l}
            onClick={() => setLang(l)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 0.75,
              py: 0.125,
              minWidth: 24,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.625rem',
              fontFamily: 'inherit',
              fontWeight: lang === l ? 650 : 400,
              letterSpacing: '0.04em',
              color: lang === l ? 'warning.softBg' : 'warning.softColor',
              bgcolor: lang === l ? 'warning.softColor' : 'transparent',
              transition: 'all 0.15s ease',
              outline: 'none',
              '&:hover': {
                opacity: lang === l ? 1 : 0.8,
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'warning.outlinedBorder',
                outlineOffset: '1px',
              },
            }}
          >
            {l.toUpperCase()}
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <WarningAmberRoundedIcon sx={{ fontSize: 18, color: 'warning.softColor' }} />
        <Typography level="title-sm" sx={{ fontWeight: 700, color: 'warning.softColor' }}>
          {t.title}
        </Typography>
      </Box>

      <Typography level="body-xs" sx={{ color: 'warning.softColor', lineHeight: 1.6, mb: 1 }}>
        {t.body}
      </Typography>

      <Typography level="body-xs" sx={{ color: 'warning.softColor', lineHeight: 1.6, fontStyle: 'italic', opacity: 0.8, mb: 1.5 }}>
        {t.responsibility}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, rowGap: 0.75, alignItems: 'center' }}>
        <Typography level="body-xs" sx={{ color: 'warning.softColor', fontWeight: 600, mr: 0.5 }}>
          {t.recommended}:
        </Typography>
        <Typography
          level="body-xs"
          component="a"
          href="https://keepassxc.org/"
          target="_blank"
          rel="noopener noreferrer"
          sx={linkSx}
        >
          KeePassXC
        </Typography>
        <Typography level="body-xs" sx={{ color: 'warning.softColor', opacity: 0.6 }}>·</Typography>
        <Typography
          level="body-xs"
          component="a"
          href="https://bitwarden.com/"
          target="_blank"
          rel="noopener noreferrer"
          sx={linkSx}
        >
          Bitwarden
        </Typography>
        <Typography level="body-xs" sx={{ color: 'warning.softColor', opacity: 0.4, mx: 0.25 }}>|</Typography>
        <Typography level="body-xs" sx={{ color: 'warning.softColor', fontWeight: 600, mr: 0.5 }}>
          {t.guidelines}:
        </Typography>
        <Typography
          level="body-xs"
          component="a"
          href="https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/mots-de-passe"
          target="_blank"
          rel="noopener noreferrer"
          sx={linkSx}
        >
          ANSSI (FR)
        </Typography>
        <Typography level="body-xs" sx={{ color: 'warning.softColor', opacity: 0.6 }}>·</Typography>
        <Typography
          level="body-xs"
          component="a"
          href="https://pages.nist.gov/800-63-4/sp800-63b.html"
          target="_blank"
          rel="noopener noreferrer"
          sx={linkSx}
        >
          NIST (US)
        </Typography>
      </Box>
    </Box>
  );
}

export default function PasswordGeneratorPage() {
  const [mode, setMode] = useState<GeneratorMode>('password');
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [keyboardSafe, setKeyboardSafe] = useState(false);
  const [wordCount, setWordCount] = useState(6);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const pool = useMemo(() => {
    let chars = '';
    if (useUpper) chars += keyboardSafe ? UPPERCASE : FULL_UPPERCASE;
    if (useLower) chars += keyboardSafe ? LOWERCASE : FULL_LOWERCASE;
    if (useDigits && !keyboardSafe) chars += DIGITS;
    if (useSymbols) {
      if (keyboardSafe) {
        const confused = new Set(AZERTY_CONFUSED_SYMBOLS.split(''));
        chars += SYMBOLS.split('').filter((c) => !confused.has(c)).join('');
      } else {
        chars += SYMBOLS;
      }
    }
    return [...new Set(chars.split(''))].join('');
  }, [useUpper, useLower, useDigits, useSymbols, keyboardSafe]);

  const generate = useCallback(() => {
    if (mode === 'passphrase') {
      setPassword(generatePassphrase(wordCount));
    } else {
      if (pool.length === 0) return;
      setPassword(generateSecurePassword(length, pool));
    }
    setCopied(false);
  }, [mode, length, pool, wordCount]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleCopy = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = password;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [password]);

  const entropy = mode === 'passphrase'
    ? wordCount * Math.log2(WORDLIST.length) + Math.log2(10)
    : calcEntropy(length, pool.length);
  const strength = getStrength(entropy);

  const atLeastOne = mode === 'passphrase' || useUpper || useLower || (useDigits && !keyboardSafe) || useSymbols;

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title="Password Generator"
        description="Generate secure random passwords with QWERTY/AZERTY keyboard-safe option. Free, no signup, runs entirely in your browser."
        path="/generate/password"
        structuredData={buildToolSchema('Password Generator', 'Generate secure random passwords with QWERTY/AZERTY keyboard-safe option. Free, no signup, runs entirely in your browser.', '/generate/password')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Password Generator
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 3 }}>
        Generate secure random passwords
      </Typography>

      <ToolDisclaimer toolId="password-generator" />

      <PasswordBestPracticeBanner />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3 }}>
        <Chip
          variant={mode === 'password' ? 'solid' : 'outlined'}
          color={mode === 'password' ? 'primary' : 'neutral'}
          onClick={() => setMode('password')}
          startDecorator={<KeyOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{ cursor: 'pointer', fontWeight: mode === 'password' ? 600 : 400 }}
        >
          Password
        </Chip>
        <Chip
          variant={mode === 'passphrase' ? 'solid' : 'outlined'}
          color={mode === 'passphrase' ? 'primary' : 'neutral'}
          onClick={() => setMode('passphrase')}
          startDecorator={<TextFieldsOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{ cursor: 'pointer', fontWeight: mode === 'passphrase' ? 600 : 400 }}
        >
          Passphrase
        </Chip>
      </Box>

      {password && atLeastOne && (
        <Sheet
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 'lg',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            level="body-md"
            sx={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              wordBreak: 'break-all',
              lineHeight: 1.5,
              userSelect: 'all',
              letterSpacing: '0.02em',
            }}
          >
            {password}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            <IconButton
              size="sm"
              variant="plain"
              color={copied ? 'success' : 'neutral'}
              onClick={handleCopy}
              title="Copy"
            >
              {copied ? <CheckOutlinedIcon /> : <ContentCopyOutlinedIcon />}
            </IconButton>
            <IconButton size="sm" variant="plain" color="neutral" onClick={generate} title="Regenerate">
              <RefreshOutlinedIcon />
            </IconButton>
          </Box>
        </Sheet>
      )}

      {password && atLeastOne && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
              Strength
            </Typography>
            <Typography level="body-xs" sx={{ color: strengthColors[strength], fontWeight: 600, textTransform: 'capitalize' }}>
              {strength}
            </Typography>
          </Box>
          <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'background.level2', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: strengthWidths[strength],
                bgcolor: strengthColors[strength],
                borderRadius: 2,
                transition: 'width 0.3s, background-color 0.3s',
              }}
            />
          </Box>
          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
            {Math.round(entropy)} bits of entropy{mode === 'password' ? ` · ${pool.length} character pool` : ` · ${wordCount} words + digit`}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          p: 2.5,
          borderRadius: 'lg',
          bgcolor: 'background.surface',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {mode === 'passphrase' ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography level="body-sm" sx={{ fontWeight: 500 }}>Words</Typography>
              <Typography level="body-sm" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{wordCount}</Typography>
            </Box>
            <Slider
              value={wordCount}
              onChange={(_, v) => setWordCount(v as number)}
              min={3}
              max={8}
              step={1}
              marks
              size="sm"
            />
          </Box>
        ) : (
          <>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography level="body-sm" sx={{ fontWeight: 500 }}>Length</Typography>
                <Input
                  type="number"
                  size="sm"
                  value={length}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 4 && v <= 128) setLength(v);
                  }}
                  slotProps={{ input: { min: 4, max: 128, style: { width: 56, textAlign: 'center' } } }}
                  sx={{ width: 72 }}
                />
              </Box>
              <Slider
                value={length}
                onChange={(_, v) => setLength(v as number)}
                min={4}
                max={128}
                step={1}
                size="sm"
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography level="body-sm" sx={{ fontWeight: 500 }}>Characters</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Checkbox
                  size="sm"
                  label="Uppercase (A-Z)"
                  checked={useUpper}
                  onChange={(e) => setUseUpper(e.target.checked)}
                />
                <Checkbox
                  size="sm"
                  label="Lowercase (a-z)"
                  checked={useLower}
                  onChange={(e) => setUseLower(e.target.checked)}
                />
                <Checkbox
                  size="sm"
                  label="Digits (0-9)"
                  checked={useDigits}
                  disabled={keyboardSafe}
                  onChange={(e) => setUseDigits(e.target.checked)}
                />
                <Checkbox
                  size="sm"
                  label="Symbols (!@#...)"
                  checked={useSymbols}
                  onChange={(e) => setUseSymbols(e.target.checked)}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography level="body-sm" sx={{ fontWeight: 500 }}>Keyboard-safe</Typography>
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                  Avoid QWERTY / AZERTY confusion (a↔q, z↔w, m, digits)
                </Typography>
              </Box>
              <Switch
                size="sm"
                checked={keyboardSafe}
                onChange={(e) => setKeyboardSafe(e.target.checked)}
              />
            </Box>
          </>
        )}
      </Box>

      {!atLeastOne && (
        <Typography level="body-sm" sx={{ color: 'danger.plainColor', mt: 2, textAlign: 'center' }}>
          Select at least one character set
        </Typography>
      )}
      <ToolSEOContent
        howTo={{
          title: 'How to generate a secure password',
          steps: [
            'Choose between Password mode (random characters) or Passphrase mode (memorable words).',
            'For passwords: adjust length, character sets, and keyboard-safe mode. For passphrases: set the number of words (3-8).',
            'Copy the generated result or click the refresh button to generate a new one.',
          ],
        }}
        features={[
          { icon: <KeyOutlinedIcon />, title: 'Cryptographically Random', description: 'Uses the Web Crypto API (crypto.getRandomValues) for truly random password generation in your browser.' },
          { icon: <AbcOutlinedIcon />, title: 'Passphrase Mode', description: 'Generate memorable passphrases from a 1296-word list — easy to remember, hard to crack.' },
          { icon: <TuneOutlinedIcon />, title: 'Flexible Settings', description: 'Password mode: 4-128 characters with configurable character sets. Passphrase mode: 3-8 words.' },
          { icon: <KeyboardOutlinedIcon />, title: 'Keyboard-Safe Mode', description: 'Avoid letters and symbols that differ between QWERTY and AZERTY layouts (a/q, z/w, m, digits).' },
          { icon: <ShieldOutlinedIcon />, title: 'Entropy Indicator', description: 'Real-time strength meter shows bits of entropy so you know exactly how strong your password is.' },
          { icon: <SecurityOutlinedIcon />, title: '100% Client-Side', description: 'Nothing leaves your browser. No passwords are sent, stored, or logged anywhere.' },
        ]}
        faq={[
          { question: 'Is this password generator secure?', answer: 'Yes. It uses the Web Crypto API (crypto.getRandomValues) which provides cryptographically secure random numbers. However, for long-term credential management, a dedicated password manager is always recommended.' },
          { question: 'Are my passwords stored anywhere?', answer: 'No. Everything runs entirely in your browser. No data is sent to any server — if you close the tab without copying, the password is gone forever.' },
          { question: 'What is a passphrase?', answer: 'A passphrase is a sequence of random words joined by dashes (e.g. Flame-Brook-Tiger-Coral3). They are easier to remember than random characters while still providing strong security — 5 words gives about 55 bits of entropy.' },
          { question: 'What does keyboard-safe mode do?', answer: 'It excludes characters that are in different positions on QWERTY and AZERTY keyboards (a, q, z, w, m, and digits) as well as symbols that move between layouts. This prevents typos when switching between keyboard types.' },
          { question: 'How long should my password be?', answer: 'For random passwords, 16+ characters with mixed character sets (80+ bits of entropy) is considered strong. For passphrases, 5+ words is a good starting point.' },
          { question: 'What is entropy?', answer: 'Entropy measures password strength in bits. It depends on both length and the size of the character pool. Higher entropy means more possible combinations and a harder password to crack.' },
        ]}
        relatedTools={[
          { label: 'QR Code Generator', href: '/qrcode' },
          { label: 'Certificate Inspector', href: '/inspect/certificate' },
          { label: 'Compress & Encrypt', href: '/archive/create' },
          { label: 'PDF Compress', href: '/compress/pdf' },
        ]}
      />
    </Box>
  );
}
