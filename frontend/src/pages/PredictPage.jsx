import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitPrediction as apiSubmit } from '../api/predictionApi';
import './PredictPage.css';

// ── Question Bank ─────────────────────────────────────────────────────────────
// Each "step" in the flow is an object:
//   { id, title, color, icon, questions[] }
// Special "gate" questions: type='gate', gateKey used to skip a section if 'No'

const STEP_DEFS = [
  // ── 0 : Age ─────────────────────────────────────────────────────────────
  {
    id: 'age', title: "Let's Start!", color: '#4361ee',
    questions: [
      {
        feature: 'age', text: "How old is your child?",
        hint: "Tap your child's age",
        type: 'scale',
        options: Array.from({ length: 13 }, (_, i) => ({ label: `${i + 5}`, value: i + 5 })),
      },
    ],
  },

  // ── 1 : Sports gate ──────────────────────────────────────────────────────
  {
    id: 'sports_gate', title: 'Sports', color: '#06d6a0',
    questions: [
      {
        feature: 'likes_sports',
        text: 'Does your child enjoy sports or physical games?',
        hint: 'Answer Yes to explore sports preferences',
        type: 'gate', gateSkipsSection: 'sports',
        options: [
          { label: 'Yes, loves it', value: 'Yes' },
          { label: 'Not really',    value: 'No'  },
        ],
      },
    ],
  },

  // ── 2 : Indoor or Outdoor ────────────────────────────────────────────────
  {
    id: 'sports_io', section: 'sports', title: 'Sports Preference', color: '#06d6a0',
    questions: [
      {
        feature: 'sport_indoor_outdoor',
        text: 'Does your child prefer indoor or outdoor sports?',
        options: [
          { label: 'Outdoor', value: 'outdoor' },
          { label: 'Indoor',  value: 'indoor'  },
          { label: 'Both',    value: 'both'    },
        ],
      },
    ],
  },

  // ── 3 : Which sport (filtered by indoor/outdoor) ─────────────────────────
  {
    id: 'sports_which', section: 'sports', title: 'Favourite Sport', color: '#06d6a0',
    questions: [
      {
        feature: 'which_sport',
        text: 'Which sport does your child enjoy the most?',
        allowOther: true,
        dynamicOptions: (ans) => {
          const io = ans.sport_indoor_outdoor;
          if (io === 'outdoor') return [
            { label: 'Cricket',      value: 'Cricket'      },
            { label: 'Football',     value: 'Football'     },
            { label: 'Basketball',   value: 'Basketball'   },
            { label: 'Athletics',    value: 'Athletics'    },
            { label: 'Swimming',     value: 'Swimming'     },
            { label: 'Other',        value: 'Other'        },
          ];
          if (io === 'indoor') return [
            { label: 'Badminton',    value: 'Badminton'    },
            { label: 'Table Tennis', value: 'Table Tennis' },
            { label: 'Carrom',       value: 'Carrom'       },
            { label: 'Chess',        value: 'Chess'        },
            { label: 'Swimming',     value: 'Swimming'     },
            { label: 'Other',        value: 'Other'        },
          ];
          return [
            { label: 'Cricket',      value: 'Cricket'      },
            { label: 'Football',     value: 'Football'     },
            { label: 'Basketball',   value: 'Basketball'   },
            { label: 'Badminton',    value: 'Badminton'    },
            { label: 'Table Tennis', value: 'Table Tennis' },
            { label: 'Swimming',     value: 'Swimming'     },
            { label: 'Other',        value: 'Other'        },
          ];
        },
        options: [],
      },
    ],
  },

  // ── 4 : Hours per day ────────────────────────────────────────────────────
  {
    id: 'sports_hours', section: 'sports', title: 'Sports Time', color: '#06d6a0',
    questions: [
      {
        feature: 'sport_hours_per_day',
        text: 'How much time does your child spend playing sports daily?',
        options: [
          { label: 'Less than 1 hour', value: 'Low'    },
          { label: '1 to 2 hours',     value: 'Medium' },
          { label: 'More than 2 hours',value: 'High'   },
        ],
      },
    ],
  },

  // ── 5 : Team or solo ─────────────────────────────────────────────────────
  {
    id: 'sports_team', section: 'sports', title: 'Play Style', color: '#06d6a0',
    questions: [
      {
        feature: 'sport_team_solo',
        text: 'Your child prefers playing…',
        options: [
          { label: 'In a team',       value: 'Team'       },
          { label: 'Alone or 1-on-1', value: 'Individual' },
        ],
      },
    ],
  },

  // ── 6 : Activity level ───────────────────────────────────────────────────
  {
    id: 'sports_activity', section: 'sports', title: 'Activity Level', color: '#06d6a0',
    questions: [
      {
        feature: 'sport_activity_level',
        text: 'How physically active is your child during sports?',
        options: [
          { label: 'Calm / low intensity', value: 'Low'    },
          { label: 'Moderate',             value: 'Medium' },
          { label: 'Very energetic',       value: 'High'   },
        ],
      },
    ],
  },

  // ── 7 : Sport frequency (NEW) ────────────────────────────────────────────
  {
    id: 'sports_freq', section: 'sports', title: 'Sports Frequency', color: '#06d6a0',
    questions: [
      {
        feature: 'sport_frequency',
        text: 'How many days per week does your child play sports?',
        options: [
          { label: '1-2 days',  value: '1-2 days' },
          { label: '3-4 days',  value: '3-4 days' },
          { label: '5+ days',   value: '5+ days'  },
        ],
      },
    ],
  },

  // ── 7 : Arts gate ────────────────────────────────────────────────────────
  {
    id: 'arts_gate', title: 'Arts & Creativity', color: '#f72585',
    questions: [
      {
        feature: 'likes_arts',
        text: 'Does your child enjoy any form of art?',
        hint: 'Drawing, Music, Dance etc.',
        type: 'gate', gateSkipsSection: 'arts',
        options: [
          { label: 'Yes, very much', value: 'Yes' },
          { label: 'Not really',    value: 'No'  },
        ],
      },
    ],
  },

  // ── 8 : Which art ────────────────────────────────────────────────────────
  {
    id: 'arts_which', section: 'arts', title: 'Art Type', color: '#f72585',
    questions: [
      {
        feature: 'which_art',
        text: 'Which type of art does your child enjoy most?',
        allowOther: true,
        options: [
          { label: 'Drawing / Sketching',         value: 'Drawing' },
          { label: 'Music (singing/instruments)', value: 'Music'   },
          { label: 'Dance',                       value: 'Dance'   },
          { label: 'Other',                       value: 'Other'   },
        ],
      },
    ],
  },

  // ── 9 : Creativity ───────────────────────────────────────────────────────
  {
    id: 'arts_creativity', section: 'arts', title: 'Creativity Level', color: '#f72585',
    questions: [
      {
        feature: 'art_creativity',
        text: 'How creative is your child?',
        options: [
          { label: 'Not very creative', value: 'Low'    },
          { label: 'Average',           value: 'Medium' },
          { label: 'Very creative',     value: 'High'   },
        ],
      },
    ],
  },

  // ── 10 : Performance ─────────────────────────────────────────────────────
  {
    id: 'arts_perf', section: 'arts', title: 'Performance', color: '#f72585',
    questions: [
      {
        feature: 'art_performance',
        text: 'Does your child enjoy performing on stage?',
        options: [
          { label: 'Yes, loves the spotlight', value: 'Yes' },
          { label: 'Prefers behind the scenes',value: 'No'  },
        ],
      },
    ],
  },

  // ── 11 : Art hours ───────────────────────────────────────────────────────
  {
    id: 'arts_hours', section: 'arts', title: 'Art Time', color: '#f72585',
    questions: [
      {
        feature: 'art_hours',
        text: 'How much time does your child spend on arts daily?',
        options: [
          { label: 'Less than 30 min', value: 'Low'    },
          { label: '30 min to 1 hour', value: 'Medium' },
          { label: 'More than 1 hour', value: 'High'   },
        ],
      },
    ],
  },

  // ── 13 : Art learning style ──────────────────────────────────────────────
  {
    id: 'arts_learn', section: 'arts', title: 'Learning Style', color: '#f72585',
    questions: [
      {
        feature: 'art_learning_style',
        text: 'How does your child prefer to learn art?',
        options: [
          { label: 'With a teacher / structured lessons', value: 'Structured' },
          { label: 'Self-taught / free exploration',      value: 'Free'       },
        ],
      },
    ],
  },

  // ── 14 : Digital or Traditional art (NEW) ────────────────────────────────
  {
    id: 'arts_digital', section: 'arts', title: 'Art Medium', color: '#f72585',
    questions: [
      {
        feature: 'art_digital_traditional',
        text: 'Does your child prefer digital or traditional art?',
        options: [
          { label: 'Digital (tablet, computer)',  value: 'Digital'     },
          { label: 'Traditional (paper, canvas)', value: 'Traditional' },
          { label: 'Both',                        value: 'Both'        },
        ],
      },
    ],
  },

  // ── 13 : Academics gate ──────────────────────────────────────────────────
  {
    id: 'acad_gate', title: 'Academics', color: '#4361ee',
    questions: [
      {
        feature: 'likes_academics',
        text: 'Does your child enjoy studying or learning subjects?',
        hint: 'Math, Science, Languages etc.',
        type: 'gate', gateSkipsSection: 'academics',
        options: [
          { label: 'Yes, a keen learner', value: 'Yes' },
          { label: 'Not much',            value: 'No'  },
        ],
      },
    ],
  },

  // ── 14 : Favourite subject ───────────────────────────────────────────────
  {
    id: 'acad_subject', section: 'academics', title: 'Favourite Subject', color: '#4361ee',
    questions: [
      {
        feature: 'fav_subject',
        text: 'Which subject does your child enjoy the most?',
        allowOther: true,
        options: [
          { label: 'Mathematics',       value: 'Math'     },
          { label: 'Science',           value: 'Science'  },
          { label: 'Language / English',value: 'Language' },
          { label: 'Other',             value: 'Other'    },
        ],
      },
    ],
  },

  // ── 15 : Problem solving ─────────────────────────────────────────────────
  {
    id: 'acad_ps', section: 'academics', title: 'Problem Solving', color: '#4361ee',
    questions: [
      {
        feature: 'acad_problem_solving',
        text: 'Does your child enjoy solving tough problems?',
        options: [
          { label: 'Yes, loves challenges', value: 'Yes' },
          { label: 'Prefers easy tasks',    value: 'No'  },
        ],
      },
    ],
  },

  // ── 16 : Curiosity ───────────────────────────────────────────────────────
  {
    id: 'acad_curious', section: 'academics', title: 'Curiosity', color: '#4361ee',
    questions: [
      {
        feature: 'acad_curiosity',
        text: 'Is your child naturally curious — always asking "why"?',
        options: [
          { label: 'Yes, very curious',  value: 'Yes' },
          { label: 'Not particularly',   value: 'No'  },
        ],
      },
    ],
  },

  // ── 17 : Study type ──────────────────────────────────────────────────────
  {
    id: 'acad_study', section: 'academics', title: 'Study Style', color: '#4361ee',
    questions: [
      {
        feature: 'acad_study_type',
        text: 'Your child studies better…',
        options: [
          { label: 'Alone / independently', value: 'Individual' },
          { label: 'In a group',            value: 'Group'      },
        ],
      },
    ],
  },

  // ── 20 : Competitions ────────────────────────────────────────────────────
  {
    id: 'acad_comp', section: 'academics', title: 'Competitions', color: '#4361ee',
    questions: [
      {
        feature: 'acad_competitions',
        text: 'Does your child enjoy participating in competitions or olympiads?',
        options: [
          { label: 'Yes, loves competing',  value: 'Yes' },
          { label: 'Prefers regular study', value: 'No'  },
        ],
      },
    ],
  },

  // ── 21 : Reading habit (NEW) ─────────────────────────────────────────────
  {
    id: 'acad_reading', section: 'academics', title: 'Reading Habit', color: '#4361ee',
    questions: [
      {
        feature: 'acad_reading_habit',
        text: 'Does your child enjoy reading books or articles?',
        options: [
          { label: 'Yes, reads regularly',  value: 'Yes' },
          { label: 'Not really',            value: 'No'  },
        ],
      },
    ],
  },

  // ── 19 : Analytical gate ─────────────────────────────────────────────────
  {
    id: 'analy_gate', title: 'Thinking & Puzzles', color: '#7209b7',
    questions: [
      {
        feature: 'likes_analytical',
        text: 'Does your child enjoy puzzles, brain games, or coding?',
        hint: 'Chess, Sudoku, programming toys etc.',
        type: 'gate', gateSkipsSection: 'analytical',
        options: [
          { label: 'Yes, a problem-solver', value: 'Yes' },
          { label: 'Not really',            value: 'No'  },
        ],
      },
    ],
  },

  // ── 20 : Puzzle type ─────────────────────────────────────────────────────
  {
    id: 'analy_type', section: 'analytical', title: 'Puzzle Type', color: '#7209b7',
    questions: [
      {
        feature: 'analy_puzzle_type',
        text: 'What kind of thinking activity does your child love most?',
        allowOther: true,
        options: [
          { label: 'Chess / board games',    value: 'Puzzles'       },
          { label: 'Coding / programming',   value: 'Coding'        },
          { label: 'Logical games / strategy',value:'Logical Games' },
          { label: 'Robots / electronics',   value: 'Robotics'      },
          { label: 'Other',                  value: 'Other'         },
        ],
      },
    ],
  },

  // ── 21 : Logic level ─────────────────────────────────────────────────────
  {
    id: 'analy_logic', section: 'analytical', title: 'Logical Thinking', color: '#7209b7',
    questions: [
      {
        feature: 'analy_logic_level',
        text: "How strong is your child's logical thinking?",
        options: [
          { label: 'Needs help often', value: 'Low'    },
          { label: 'Average',          value: 'Medium' },
          { label: 'Very sharp',       value: 'High'   },
        ],
      },
    ],
  },

  // ── 22 : Challenge response ──────────────────────────────────────────────
  {
    id: 'analy_challenge', section: 'analytical', title: 'Persistence', color: '#7209b7',
    questions: [
      {
        feature: 'analy_challenge',
        text: 'When faced with a hard problem, your child…',
        options: [
          { label: 'Keeps trying until solved', value: 'Yes' },
          { label: 'Gives up easily',           value: 'No'  },
        ],
      },
    ],
  },

  // ── 23 : Work style ──────────────────────────────────────────────────────
  {
    id: 'analy_work', section: 'analytical', title: 'Work Style', color: '#7209b7',
    questions: [
      {
        feature: 'analy_work_style',
        text: 'Your child prefers to solve problems…',
        options: [
          { label: 'Alone / independently',    value: 'Alone'       },
          { label: 'With others',              value: 'With others' },
        ],
      },
    ],
  },

  // ── 27 : Coding interest ─────────────────────────────────────────────────
  {
    id: 'analy_coding', section: 'analytical', title: 'Coding Interest', color: '#7209b7',
    questions: [
      {
        feature: 'analy_coding_interest',
        text: 'Is your child interested in computers or coding?',
        options: [
          { label: 'Yes, very interested', value: 'Yes' },
          { label: 'Not particularly',     value: 'No'  },
        ],
      },
    ],
  },

  // ── 28 : Patience level (NEW) ────────────────────────────────────────────
  {
    id: 'analy_patience', section: 'analytical', title: 'Patience Level', color: '#7209b7',
    questions: [
      {
        feature: 'analy_patience_level',
        text: 'How patient is your child when solving difficult puzzles?',
        options: [
          { label: 'Gets frustrated quickly', value: 'Low'    },
          { label: 'Somewhat patient',        value: 'Medium' },
          { label: 'Very patient and focused', value: 'High'  },
        ],
      },
    ],
  },

  // ── 25 : Health condition ────────────────────────────────────────────────
  {
    id: 'health_condition', title: 'Health & Wellness', color: '#f97316',
    questions: [
      {
        feature: 'health_condition',
        text: 'Does your child have any health condition we should know about?',
        hint: 'This helps us avoid recommending harmful activities',
        options: [
          { label: 'No known condition',       value: 'None'       },
          { label: 'Asthma / breathing issues',value: 'Asthma'     },
          { label: 'Joint pain / bone issues', value: 'Joint Pain' },
          { label: 'Other condition',          value: 'Other'      },
        ],
      },
    ],
  },

  // ── 26 : Energy level ────────────────────────────────────────────────────
  {
    id: 'health_energy', title: 'Energy Level', color: '#f97316',
    questions: [
      {
        feature: 'health_energy',
        text: "What is your child's general energy level?",
        options: [
          { label: 'Low / calm',  value: 'Low'    },
          { label: 'Moderate',    value: 'Medium' },
          { label: 'Very high',   value: 'High'   },
        ],
      },
    ],
  },

  // ── 27 : Outdoor preference ──────────────────────────────────────────────
  {
    id: 'health_outdoor', title: 'Outdoor Preference', color: '#f97316',
    questions: [
      {
        feature: 'health_outdoor_preference',
        text: 'Does your child prefer outdoor activities?',
        options: [
          { label: 'Yes, loves being outside', value: 'Yes' },
          { label: 'Prefers staying indoors',  value: 'No'  },
        ],
      },
    ],
  },

  // ── 28 : Activity preference ─────────────────────────────────────────────
  {
    id: 'health_actpref', title: 'Physical Activity', color: '#f97316',
    questions: [
      {
        feature: 'health_activity_preference',
        text: 'Which physical activity would your child enjoy most?',
        allowOther: true,
        options: [
          { label: 'Yoga',                 value: 'Yoga'       },
          { label: 'Gymnastics',           value: 'Gymnastics' },
          { label: 'Running / Jogging',    value: 'Running'    },
          { label: 'Meditation',           value: 'Meditation' },
          { label: 'Swimming',             value: 'Swimming'   },
          { label: 'Other',                value: 'Other'      },
        ],
      },
    ],
  },

  // ── 34 : Activity hours ──────────────────────────────────────────────────
  {
    id: 'health_hours', title: 'Activity Time', color: '#f97316',
    questions: [
      {
        feature: 'health_hours',
        text: 'How much time does your child spend on physical activity daily?',
        options: [
          { label: 'Less than 30 min', value: 'Low'    },
          { label: '30 min to 1 hour', value: 'Medium' },
          { label: 'More than 1 hour', value: 'High'   },
        ],
      },
    ],
  },

  // ── 35 : Sleep quality (NEW) ─────────────────────────────────────────────
  {
    id: 'health_sleep', title: 'Sleep Quality', color: '#f97316',
    questions: [
      {
        feature: 'health_sleep_quality',
        text: 'How well does your child sleep at night?',
        options: [
          { label: 'Poorly / restless',       value: 'Poor'    },
          { label: 'Average',                 value: 'Average' },
          { label: 'Sleeps well',             value: 'Good'    },
        ],
      },
    ],
  },
];

// ── Section to step-id mapping (for gate logic) ───────────────────────────────
const SECTION_STEPS = {
  sports:     ['sports_io','sports_which','sports_hours','sports_team','sports_activity','sports_freq'],
  arts:       ['arts_which','arts_creativity','arts_perf','arts_hours','arts_learn','arts_digital'],
  academics:  ['acad_subject','acad_ps','acad_curious','acad_study','acad_comp','acad_reading'],
  analytical: ['analy_type','analy_logic','analy_challenge','analy_work','analy_coding','analy_patience'],
};


// Default values for skipped sections
const SECTION_DEFAULTS = {
  sports: {
    sport_indoor_outdoor: 'None', which_sport: 'None',
    sport_hours_per_day: 'None', sport_team_solo: 'None',
    sport_activity_level: 'None', sport_frequency: 'None',
  },
  arts: {
    which_art: 'None', art_creativity: 'None', art_performance: 'None',
    art_hours: 'None', art_learning_style: 'None', art_digital_traditional: 'None',
  },
  academics: {
    fav_subject: 'None', acad_problem_solving: 'None',
    acad_curiosity: 'None', acad_study_type: 'None', acad_competitions: 'None',
    acad_reading_habit: 'None',
  },
  analytical: {
    analy_puzzle_type: 'None', analy_logic_level: 'None',
    analy_challenge: 'None', analy_work_style: 'None', analy_coding_interest: 'None',
    analy_patience_level: 'None',
  },
};

// ── Build visible step sequence based on answers ──────────────────────────────
function buildStepSequence(answers) {
  const skippedSections = new Set();
  if (answers.likes_sports === 'No')     skippedSections.add('sports');
  if (answers.likes_arts === 'No')       skippedSections.add('arts');
  if (answers.likes_academics === 'No')  skippedSections.add('academics');
  if (answers.likes_analytical === 'No') skippedSections.add('analytical');

  return STEP_DEFS.filter(step => {
    if (!step.section) return true;           // no section = always show
    return !skippedSections.has(step.section);
  });
}

// ── Count total visible questions ─────────────────────────────────────────────
function countVisibleQuestions(steps) {
  return steps.reduce((acc, s) => acc + s.questions.length, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PredictPage() {
  const navigate = useNavigate();

  const [stepIdx,    setStepIdx]    = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [animClass,  setAnimClass]  = useState('anim-enter');

  // Recompute visible steps whenever answers change
  const visibleSteps   = buildStepSequence(answers);
  const step           = visibleSteps[stepIdx];
  const isLast         = stepIdx === visibleSteps.length - 1;
  const totalVisible   = countVisibleQuestions(visibleSteps);
  const answeredSoFar  = answers ? Object.keys(answers).length : 0;
  const progressPct    = Math.round((stepIdx / Math.max(visibleSteps.length - 1, 1)) * 100);

  function handleAnswer(feature, value) {
    setAnswers(prev => {
      const next = { ...prev, [feature]: value };

      // If indoor/outdoor changes, clear any previously selected sport
      // that might now be in the wrong category
      if (feature === 'sport_indoor_outdoor') {
        delete next.which_sport;
      }

      // If a gate answer is set to 'No', inject defaults for that section
      const q = step?.questions?.find(q => q.feature === feature);
      if (q?.type === 'gate' && value === 'No' && q.gateSkipsSection) {
        Object.assign(next, SECTION_DEFAULTS[q.gateSkipsSection]);
      }
      // If switched to 'Yes', clear the defaults so user fills them
      if (q?.type === 'gate' && value === 'Yes' && q.gateSkipsSection) {
        const defaults = SECTION_DEFAULTS[q.gateSkipsSection];
        Object.keys(defaults).forEach(k => { delete next[k]; });
      }
      return next;
    });
  }

  function isStepComplete() {
    if (!step) return false;
    return step.questions.every(q => {
      if (answers[q.feature] === undefined) return false;
      // If "Other" selected, must have typed a custom value
      if (q.allowOther && answers[q.feature] === 'Other') {
        return !!(answers[q.feature + '_custom'] || '').trim();
      }
      // For dynamic-option questions, also verify the selected value
      // is still valid after re-filtering (e.g. indoor/outdoor change)
      if (q.dynamicOptions) {
        const opts = q.dynamicOptions(answers);
        return opts.some(o => o.value === answers[q.feature]);
      }
      return true;
    });
  }

  function transition(newIdx) {
    setAnimClass('anim-exit');
    setTimeout(() => {
      setStepIdx(newIdx);
      setAnimClass('anim-enter');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }

  function handleNext() {
    if (!isStepComplete()) return;
    if (isLast) { submitPrediction(); return; }
    transition(stepIdx + 1);
  }

  function handleBack() {
    if (stepIdx === 0) return;
    transition(stepIdx - 1);
  }

  async function submitPrediction() {
    setLoading(true); setError('');
    try {
      const res = await apiSubmit(answers);
      navigate('/result', { state: { prediction: res.data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed. Please try again.');
      setLoading(false);
    }
  }

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="qz-loading">
        <div className="qz-spinner" />
        <h2>Analysing your child's profile…</h2>
        <p className="sub">Finding the perfect hobby match ✨</p>
      </div>
    );
  }

  // ── Intro banner (only on step 0) ─────────────────────────────────────────
  return (
    <div className="qz-page">
      {stepIdx === 0 && (
        <div className="qz-intro">
          <h1>Discover Your Child's<br /><span>Perfect Hobby</span></h1>
          <p>
            Answer <strong>up to 30 questions</strong> about your child across
            Sports, Arts, Academics, Analytical Thinking and Health.
            Sections you skip are personalised automatically!
          </p>
          <div className="qz-meta">
            <span className="qz-meta-item">~5 min</span>
            <span className="qz-meta-sep" />
            <span className="qz-meta-item">{visibleSteps.length} Steps</span>
            <span className="qz-meta-sep" />
            <span className="qz-meta-item">20+ Hobbies</span>
          </div>
        </div>
      )}

      <div className={`qz-card ${animClass}`}>
        {/* ── Progress bar ─────────────────────────────────────────────── */}
        <div className="qz-header">
          <div className="qz-progress-bar">
            <div className="qz-progress-fill" style={{ width: `${progressPct}%`, background: step?.color }} />
          </div>
          <div className="qz-section-label">
            <span className="qz-section-name" style={{ color: step?.color }}>{step?.title}</span>
            <span className="qz-step-counter">Step {stepIdx + 1} / {visibleSteps.length}</span>
          </div>
        </div>

        {/* ── Questions ──────────────────────────────────────────────────── */}
        <div className="qz-body">
          {step?.questions.map((q) => {
            // Resolve options: dynamic (filtered) or static
            const resolvedOptions = q.dynamicOptions ? q.dynamicOptions(answers) : q.options;
            return (
            <div key={q.feature} className="qz-block">
              <div className="qz-question">
                {q.text}
                {q.hint && <span className="qz-hint">{q.hint}</span>}
              </div>

              {q.type === 'scale' ? (
                /* Age picker */
                <div className="qz-scale">
                  {resolvedOptions.map(o => (
                    <div
                      key={o.value}
                      className={`qz-scale-btn ${answers[q.feature] === o.value ? 'selected' : ''}`}
                      onClick={() => handleAnswer(q.feature, o.value)}
                    >
                      {o.label}
                    </div>
                  ))}
                </div>
              ) : q.type === 'gate' ? (
                /* Gate question — big card style */
                <div className="qz-gate-opts">
                  {resolvedOptions.map(o => (
                    <div
                      key={o.value}
                      className={`qz-gate-opt ${answers[q.feature] === o.value ? 'selected' : ''}`}
                      style={answers[q.feature] === o.value ? { borderColor: step.color, background: `${step.color}18` } : {}}
                      onClick={() => handleAnswer(q.feature, o.value)}
                    >
                      {o.label}
                    </div>
                  ))}
                </div>
              ) : (
                /* Standard option list */
                <div className="qz-options">
                  {resolvedOptions.map(o => (
                    <div
                      key={o.value}
                      className={`qz-opt ${answers[q.feature] === o.value ? 'selected' : ''}`}
                      style={answers[q.feature] === o.value ? { borderColor: step.color, background: `${step.color}15` } : {}}
                      onClick={() => handleAnswer(q.feature, o.value)}
                    >
                      <div className="qz-bubble" style={answers[q.feature] === o.value ? { background: step.color, borderColor: step.color } : {}} />
                      <span className="qz-opt-text">{o.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* "Other" text input — visible when Other is selected */}
              {q.allowOther && answers[q.feature] === 'Other' && (
                <div className="qz-other-input">
                  <input
                    type="text"
                    placeholder="Type your answer here…"
                    value={answers[q.feature + '_custom'] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.feature + '_custom']: e.target.value }))}
                    autoFocus
                    className="qz-text-input"
                    style={{ borderColor: step.color }}
                  />
                </div>
              )}
            </div>
            );
          })}
        </div>

        {error && <div className="qz-error">⚠️ {error}</div>}

        {/* ── Nav buttons ─────────────────────────────────────────────────── */}
        <div className="qz-nav">
          <button className="qz-btn-back" disabled={stepIdx === 0} onClick={handleBack}>
            ← Back
          </button>
          <button
            className={`qz-btn-next ${isStepComplete() ? 'active' : ''}`}
            style={isStepComplete() ? { background: step?.color } : {}}
            onClick={handleNext}
            disabled={!isStepComplete()}
          >
            {isLast ? 'Get My Hobby' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
