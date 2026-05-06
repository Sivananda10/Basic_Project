// stepDefs_v5.js — v5 questionnaire with Likert scales for gates

const LIKERT_OPTS = [
  { label: 'Strongly Agree', value: 'Strongly Agree', emoji: '🟢' },
  { label: 'Agree',          value: 'Agree',          emoji: '🟡' },
  { label: 'Neutral',        value: 'Neutral',        emoji: '⚪' },
  { label: 'Disagree',       value: 'Disagree',       emoji: '🟠' },
  { label: 'Strongly Disagree', value: 'Strongly Disagree', emoji: '🔴' },
];

// "Agree" or "Strongly Agree" → section opens
export const AGREE_SET = new Set(['Strongly Agree', 'Agree']);

const SPORT_POOL = {
  outdoor: ['Cricket','Football','Basketball','Athletics','Swimming'],
  indoor:  ['Badminton','Table Tennis','Carrom','Chess','Swimming'],
};

function sportOpts(ans) {
  const io = ans.sport_indoor_outdoor || 'both';
  let sports;
  if (io === 'both') {
    sports = [...new Set([...SPORT_POOL.outdoor, ...SPORT_POOL.indoor])];
  } else {
    sports = SPORT_POOL[io] || SPORT_POOL.outdoor;
  }
  return [...sports.map(s => ({ label: s, value: s })), { label: 'Other', value: 'Other' }];
}

// Returns true if a sport is in the multi-selected list (for "both") or single selected
function hasSport(ans, sport) {
  const io = ans.sport_indoor_outdoor;
  if (io === 'both') {
    const sel = ans.which_sports_multi || [];
    return sel.includes(sport);
  }
  return ans.which_sport === sport;
}


export const STEP_DEFS = [
  // ── BASICS ────────────────────────────────────────────────────────
  { id:'age', title:"Let's Start!", color:'#4361ee', questions:[
    { feature:'age', text:"How old is the child?", hint:"Select the child's current age", type:'scale',
      options: Array.from({length:8},(_,i)=>({label:`${i+5}`,value:i+5})) },
  ]},
  { id:'gender', title:'About the Child', color:'#4361ee', questions:[
    { feature:'gender', text:'Is the child a boy or a girl?', hint:'This helps personalise questions slightly',
      options:[{label:'Boy',value:'Boy'},{label:'Girl',value:'Girl'}] },
  ]},

  // ── SPORTS ────────────────────────────────────────────────────────
  { id:'sports_gate', title:'Sports & Physical Activity', color:'#06d6a0', questions:[
    { feature:'likes_sports',
      text:'"My child enjoys playing sports and physical games."',
      hint:'Rate how strongly this describes your child',
      type:'likert', options: LIKERT_OPTS },
  ]},
  { id:'sports_io', section:'sports', title:'Sports Preference', color:'#06d6a0', questions:[
    { feature:'sport_indoor_outdoor', text:'Does your child prefer indoor or outdoor sports?',
      options:[{label:'🌳 Outdoor',value:'outdoor'},{label:'🏠 Indoor',value:'indoor'},{label:'Both equally',value:'both'}] },
  ]},

  // Single-pick sport (outdoor or indoor only)
  { id:'sports_which', section:'sports', title:'Favourite Sport', color:'#06d6a0',
    showIf: ans => ans.sport_indoor_outdoor !== 'both',
    questions:[
      { feature:'which_sport', text:'Which sport does your child enjoy the most?', allowOther:true,
        dynamicOptions: sportOpts, options:[] },
    ]},

  // Multi-select sport (both)
  { id:'sports_which_multi', section:'sports', title:'Select Sports (choose all that apply)', color:'#06d6a0',
    showIf: ans => ans.sport_indoor_outdoor === 'both',
    questions:[
      { feature:'which_sports_multi', text:'Which sports does your child enjoy? (Select all that apply)',
        type:'multi', allowOther:true,
        options:[
          {label:'🏏 Cricket',value:'Cricket'},{label:'⚽ Football',value:'Football'},
          {label:'🏀 Basketball',value:'Basketball'},{label:'🏃 Athletics',value:'Athletics'},
          {label:'🏊 Swimming',value:'Swimming'},{label:'🏸 Badminton',value:'Badminton'},
          {label:'🏓 Table Tennis',value:'Table Tennis'},{label:'🎱 Carrom',value:'Carrom'},
          {label:'♟️ Chess',value:'Chess'},{label:'Other',value:'Other'},
        ]},
    ]},

  // Cricket sub-questions (show if cricket selected)
  { id:'sports_cricket_role', section:'sports', title:'Cricket Role', color:'#06d6a0',
    showIf: ans => hasSport(ans, 'Cricket'),
    questions:[
      { feature:'cricket_role', text:'What role does your child prefer in Cricket?',
        options:[{label:'🏏 Batting',value:'Batting'},{label:'⚾ Bowling',value:'Bowling'},
                 {label:'🧤 Wicket Keeping',value:'Keeping'},{label:'All-rounder',value:'All-rounder'}] },
    ]},
  { id:'sports_cricket_hand', section:'sports', title:'Cricket Hand Preference', color:'#06d6a0',
    showIf: ans => hasSport(ans, 'Cricket'),
    questions:[
      { feature:'cricket_hand', text:'Is your child right-handed or left-handed in cricket?',
        options:[{label:'Right-handed',value:'Right'},{label:'Left-handed',value:'Left'}] },
    ]},

  // Football sub-question
  { id:'sports_football_pos', section:'sports', title:'Football Position', color:'#06d6a0',
    showIf: ans => hasSport(ans, 'Football'),
    questions:[
      { feature:'football_position', text:'What position does your child prefer in Football?',
        options:[{label:'⚽ Forward / Striker',value:'Forward'},{label:'🛡️ Defender',value:'Defender'},
                 {label:'🧤 Goalkeeper',value:'Goalkeeper'},{label:'🔄 Midfielder',value:'Midfielder'}] },
    ]},

  // Badminton sub-question
  { id:'sports_badminton_type', section:'sports', title:'Badminton Style', color:'#06d6a0',
    showIf: ans => hasSport(ans, 'Badminton'),
    questions:[
      { feature:'badminton_type', text:'Does your child prefer Singles or Doubles in Badminton?',
        options:[{label:'🧍 Singles',value:'Singles'},{label:'👥 Doubles',value:'Doubles'}] },
    ]},

  // Chess sub-question
  { id:'sports_chess_style', section:'sports', title:'Chess Style', color:'#06d6a0',
    showIf: ans => hasSport(ans, 'Chess'),
    questions:[
      { feature:'chess_style', text:'What style of chess does your child prefer?',
        options:[{label:'⚡ Blitz (fast)',value:'Blitz'},{label:'🕐 Classical (slow)',value:'Classical'},{label:'Both',value:'Both'}] },
    ]},

  // Sports hours / commitment (always shown in sports section)
  { id:'sports_hours', section:'sports', title:'Sports Commitment', color:'#06d6a0', questions:[
    { feature:'sport_hours_per_day', text:'"My child spends a lot of time playing sports every day."',
      type:'likert', options: LIKERT_OPTS },
  ]},
  { id:'sports_team', section:'sports', title:'Play Style', color:'#06d6a0', questions:[
    { feature:'sport_team_solo', text:'Does your child prefer playing in a team or individually?',
      options:[{label:'🤝 In a team',value:'Team'},{label:'🧍 Alone / 1-on-1',value:'Individual'}] },
  ]},
  { id:'sports_freq', section:'sports', title:'Sports Frequency', color:'#06d6a0', questions:[
    { feature:'sport_frequency', text:'How many days per week does your child play sports?',
      options:[{label:'1-2 days',value:'1-2 days'},{label:'3-4 days',value:'3-4 days'},{label:'5+ days',value:'5+ days'}] },
  ]},

  // ── ARTS ──────────────────────────────────────────────────────────
  { id:'arts_gate', title:'Arts & Creativity', color:'#f72585', questions:[
    { feature:'likes_arts',
      text:'"My child enjoys creative activities like drawing, music, dance, or acting."',
      hint:'Rate how strongly this describes your child',
      type:'likert', options: LIKERT_OPTS },
  ]},
  { id:'arts_which', section:'arts', title:'Art Type', color:'#f72585', questions:[
    { feature:'which_art', text:'Which form of art does your child enjoy most?', allowOther:true,
      options:[{label:'🎨 Drawing / Sketching',value:'Drawing'},{label:'🎵 Music (singing / instruments)',value:'Music'},
              {label:'💃 Dance',value:'Dance'},{label:'🎭 Acting / Drama',value:'Acting'},{label:'Other',value:'Other'}] },
  ]},
  { id:'arts_subtype', section:'arts', title:'Art Style', color:'#f72585', questions:[
    { feature:'art_sub_type', text:'What specific style within that art form?',
      dynamicOptions: ans => {
        const a = ans.which_art;
        if (a==='Drawing') return [{label:'🖌️ Painting',value:'Painting'},{label:'✏️ Sketching',value:'Sketching'},{label:'✂️ Craft',value:'Craft'},{label:'💻 Digital Art',value:'Digital Art'}];
        if (a==='Dance')   return [{label:'🪔 Classical',value:'Classical'},{label:'💃 Western',value:'Western'},{label:'🎪 Folk',value:'Folk'},{label:'🕺 Hip-Hop',value:'Hip-Hop'}];
        if (a==='Music')   return [{label:'🎤 Vocals / Singing',value:'Vocals'},{label:'🎸 Instrument',value:'Instrument'},{label:'🎼 Both',value:'Both'}];
        if (a==='Acting')  return [{label:'🎭 Stage Acting',value:'Stage'},{label:'😂 Improv / Comedy',value:'Improv'},{label:'🎙️ Voice Acting',value:'Voice Acting'}];
        return [{label:'General',value:'General'}];
      }, options:[] },
  ]},
  { id:'arts_creativity', section:'arts', title:'Creativity Level', color:'#f72585', questions:[
    { feature:'art_creativity',
      text:'"My child is highly creative and constantly comes up with new ideas."',
      type:'likert', options: LIKERT_OPTS },
  ]},
  { id:'arts_perf', section:'arts', title:'Stage Confidence', color:'#f72585', questions:[
    { feature:'art_performance',
      text:'"My child enjoys performing or showing their work to an audience."',
      type:'likert', options: LIKERT_OPTS },
  ]},

  // ── ANALYTICAL ────────────────────────────────────────────────────
  { id:'analy_gate', title:'Thinking & Puzzles', color:'#7209b7', questions:[
    { feature:'likes_analytical',
      text:'"My child enjoys puzzles, brain games, or strategic thinking."',
      hint:'Rate how strongly this describes your child',
      type:'likert', options: LIKERT_OPTS },
  ]},
  { id:'analy_type', section:'analytical', title:'Puzzle Type', color:'#7209b7', questions:[
    { feature:'analy_puzzle_type', text:'What kind of thinking activity does your child enjoy?', allowOther:true,
      options:[{label:'♟️ Chess / Board games',value:'Puzzles'},{label:'💻 Technology / Computers',value:'Coding'},
              {label:'🧩 Logical games / Strategy',value:'Logical Games'},{label:'🤖 Robots / Electronics',value:'Robotics'},{label:'Other',value:'Other'}] },
  ]},
  { id:'analy_logic', section:'analytical', title:'Logical Thinking', color:'#7209b7', questions:[
    { feature:'analy_logic_level',
      text:'"My child has strong logical reasoning skills and thinks things through carefully."',
      type:'likert', options: LIKERT_OPTS },
  ]},
  { id:'analy_tech', section:'analytical', title:'Technology Interest', color:'#7209b7', questions:[
    { feature:'analy_coding_interest',
      text:'"My child is interested in computers, digital tools, or technology."',
      type:'likert', options: LIKERT_OPTS },
  ]},
  { id:'analy_patience', section:'analytical', title:'Patience & Persistence', color:'#7209b7', questions:[
    { feature:'analy_patience_level',
      text:'"My child is very patient and keeps trying until they solve a difficult problem."',
      type:'likert', options: LIKERT_OPTS },
  ]},

  // ── COOKING ───────────────────────────────────────────────────────
  { id:'cook_gate', title:'Cooking & Baking', color:'#22c55e', questions:[
    { feature:'likes_cooking',
      text:'"My child enjoys cooking, baking, or experimenting in the kitchen."',
      type:'likert', options: LIKERT_OPTS },
  ]},
  { id:'cook_type', section:'cooking', title:'Cooking Type', color:'#22c55e', questions:[
    { feature:'cooking_type', text:'What kind of cooking does your child prefer?',
      options:[{label:'🍰 Baking (cakes, cookies)',value:'Baking'},{label:'👨‍🍳 Cooking meals',value:'Cooking Meals'},{label:'Both equally',value:'Both'}] },
  ]},

  // ── GARDENING ─────────────────────────────────────────────────────
  { id:'gard_gate', title:'Gardening & Nature', color:'#22c55e', questions:[
    { feature:'likes_gardening',
      text:'"My child enjoys gardening, being in nature, and caring for plants."',
      type:'likert', options: LIKERT_OPTS },
  ]},
  { id:'gard_type', section:'gardening', title:'Garden Type', color:'#22c55e', questions:[
    { feature:'gardening_type', text:'What kind of gardening does your child enjoy?',
      options:[{label:'🌸 Flowers & Plants',value:'Plants/Flowers'},{label:'🥕 Vegetables',value:'Vegetables'},{label:'Both',value:'Both'}] },
  ]},

  // ── SCREEN & DIGITAL ─────────────────────────────────────────────
  { id:'screen_gate', title:'Screen & Digital', color:'#8b5cf6', questions:[
    { feature:'screen_usage_hours', text:'How much screen time does your child have daily?',
      options:[{label:'Less than 1 hour',value:'Low'},{label:'1 to 3 hours',value:'Medium'},{label:'3+ hours',value:'High'}] },
  ]},
  { id:'screen_content', title:'Screen Content', color:'#8b5cf6', questions:[
    { feature:'screen_content_type', text:'What does your child mostly do on screen?',
      options:[{label:'🎮 Gaming',value:'Gaming'},{label:'📚 Educational videos',value:'Educational'},
              {label:'📱 Social media / chat',value:'Social'},{label:'🎨 Creating content / art',value:'Creative Content'},{label:'🔀 Mixed',value:'Mixed'}] },
  ]},
  { id:'screen_gaming', title:'Gaming Type', color:'#8b5cf6',
    showIf: ans => ans.screen_content_type === 'Gaming',
    questions:[
    { feature:'gaming_genre', text:'What type of games does your child prefer?',
      options:[{label:'🧠 Strategy / Planning',value:'Strategy'},{label:'💥 Action',value:'Action'},
              {label:'🧩 Puzzle games',value:'Puzzle'},{label:'⚔️ Adventure / RPG',value:'Adventure'}] },
  ]},
  { id:'screen_design', title:'Digital Creation', color:'#8b5cf6', questions:[
    { feature:'game_design_interest',
      text:'"My child is interested in creating games, apps, or digital content."',
      type:'likert', options: LIKERT_OPTS },
  ]},

  // ── HEALTH ────────────────────────────────────────────────────────
  { id:'health_condition', title:'Health & Wellness', color:'#f97316', questions:[
    { feature:'health_condition', text:'Does your child have any health condition we should consider?',
      hint:'This helps us recommend safe activities',
      options:[{label:'✅ No known condition',value:'None'},{label:'🫁 Asthma / breathing issues',value:'Asthma'},
              {label:'🦴 Joint pain / bone issues',value:'Joint Pain'},{label:'🧩 Autism spectrum',value:'Autism'},
              {label:'♿ Physical limitation',value:'Physical Limitation'},{label:'Other',value:'Other'}] },
  ]},
  { id:'health_energy', title:'Energy Level', color:'#f97316', questions:[
    { feature:'health_energy',
      text:'"My child has a very high energy level and is always active."',
      type:'likert', options: LIKERT_OPTS },
  ]},
  { id:'health_actpref', title:'Wellness Activity', color:'#f97316', questions:[
    { feature:'health_activity_preference', text:'Which wellness activity would your child enjoy most?', allowOther:true,
      options:[{label:'🧘 Yoga',value:'Yoga'},{label:'🤸 Gymnastics',value:'Gymnastics'},{label:'🏃 Running / Jogging',value:'Running'},
              {label:'🌿 Meditation',value:'Meditation'},{label:'🏊 Swimming',value:'Swimming'},{label:'Other',value:'Other'}] },
  ]},
  { id:'health_sleep', title:'Sleep Quality', color:'#f97316', questions:[
    { feature:'health_sleep_quality', text:'How well does your child sleep?',
      options:[{label:'😴 Poorly / restless',value:'Poor'},{label:'😐 Average',value:'Average'},{label:'😊 Sleeps well',value:'Good'}] },
  ]},

  // ── BEHAVIORAL ────────────────────────────────────────────────────
  { id:'behav_whom', title:'Social Preference', color:'#ec4899', questions:[
    { feature:'activity_with_whom', text:'Who does your child usually do activities with?',
      options:[{label:'🧍 Alone',value:'Alone'},{label:'👨‍👩‍👧 With family',value:'With Family'},
              {label:'👫 With friends',value:'With Friends'},{label:'🔀 Mix of all',value:'Mixed'}] },
  ]},
  { id:'behav_emotion', title:'Engagement & Drive', color:'#ec4899', questions:[
    { feature:'emotional_engagement',
      text:'"My child gets deeply passionate and emotionally invested in their favourite activities."',
      type:'likert', options: LIKERT_OPTS },
  ]},

  // ── PREVIOUS HOBBY ────────────────────────────────────────────────
  { id:'prev_hobby_gate', title:'Previous Experience', color:'#14b8a6', questions:[
    { feature:'tried_hobby_before', text:'Has your child seriously tried any hobby before?',
      options:[{label:'Yes, they have',value:'Yes'},{label:'No, this is their first time',value:'No'}],
      type:'gate', gateSkipsSection:'prev_hobby' },
  ]},
  { id:'prev_hobby_name', section:'prev_hobby', title:'Previous Hobby', color:'#14b8a6', questions:[
    { feature:'previous_hobby_name', text:'Which hobby was tried before?', allowOther:true,
      options:[{label:'Cricket',value:'Cricket'},{label:'Football',value:'Football'},{label:'Drawing',value:'Drawing'},
              {label:'Dance',value:'Dance'},{label:'Music',value:'Music'},{label:'Chess',value:'Chess'},
              {label:'Coding',value:'Coding'},{label:'Swimming',value:'Swimming'},{label:'Yoga',value:'Yoga'},
              {label:'Other',value:'Other'}] },
  ]},
  { id:'prev_hobby_reason', section:'prev_hobby', title:'Why Stopped', color:'#14b8a6', questions:[
    { feature:'stopped_reason', text:'Why did they stop?',
      options:[{label:'Lost interest',value:'Lost Interest'},{label:'Teacher / Coach issue',value:'Teacher/Coach Issue'},
              {label:'Environment issue',value:'Environment Issue'},{label:'No resources available',value:'No Resources'},
              {label:'Completed / mastered it',value:'Completed It'}] },
  ]},
];

export const SECTION_STEPS = {
  sports:     ['sports_io','sports_which','sports_which_multi','sports_cricket_role','sports_cricket_hand','sports_football_pos','sports_badminton_type','sports_chess_style','sports_hours','sports_team','sports_freq'],
  arts:       ['arts_which','arts_subtype','arts_creativity','arts_perf'],
  analytical: ['analy_type','analy_logic','analy_tech','analy_patience'],
  cooking:    ['cook_type'],
  gardening:  ['gard_type'],
  prev_hobby: ['prev_hobby_name','prev_hobby_reason'],
};

export const SECTION_DEFAULTS = {
  sports:     { sport_indoor_outdoor:'None', which_sport:'None', sport_hours_per_day:'Disagree', sport_team_solo:'None', sport_activity_level:'None', sport_frequency:'None' },
  arts:       { which_art:'None', art_sub_type:'None', art_creativity:'Disagree', art_performance:'Disagree', art_hours:'None', art_learning_style:'None', art_digital_traditional:'None', art_with_whom:'None' },
  analytical: { analy_puzzle_type:'None', analy_logic_level:'Disagree', analy_challenge:'None', analy_work_style:'None', analy_coding_interest:'Disagree', analy_patience_level:'Disagree' },
  cooking:    { cooking_type:'None' },
  gardening:  { gardening_type:'None', nature_interest:'None' },
  prev_hobby: { previous_hobby_name:'None', stopped_reason:'None' },
};

export const GLOBAL_DEFAULTS = {
  art_with_whom:'None', dance_style:'None', music_type:'None', acting_interest:'No',
  performance_stage_comfort:'None', personality_type:'Ambivert', creativity_score:'5',
  leadership_tendency:'Medium', attention_span:'Medium',
  sport_activity_level:'None', art_hours:'None', art_learning_style:'None',
  art_digital_traditional:'None', acad_curiosity:'None', acad_reading_habit:'None',
  analy_challenge:'None', analy_work_style:'None', nature_interest:'None',
  digital_creation_interest:'No', health_outdoor_preference:'No', health_hours:'None',
  activity_time_of_day:'Anytime', initiative_level:'Depends on Mood',
};

// Likert → ML binary mapping
export function likertToML(val) {
  return AGREE_SET.has(val) ? 'Yes' : 'No';
}

// Likert → Level mapping (for hours, creativity, etc.)
export function likertToLevel(val) {
  if (val === 'Strongly Agree') return 'High';
  if (val === 'Agree') return 'Medium';
  return 'Low';
}
