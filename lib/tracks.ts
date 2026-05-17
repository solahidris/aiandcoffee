export type TrackType = "instrumental" | "vocal";
export type RepeatMode = "none" | "all" | "one";

export interface Track {
  id: number;
  title: string;
  artist: string;
  src: string;
  type: TrackType;
  lyrics?: string;
}

const LYRICS_MIDNIGHT = `[Verse 1]
Got the laptop glow on the wall
Cold mug on the desk, that's all
Two tabs open, one brave plan
Me, this code, and a tired hand

Lines on the screen like rain
I fix one thing, it breaks again
Still I stay in the little blue light
Chasing a clean build through the night

[Pre-Chorus]
Say it one more time
Make it make sense
AI, help me out
Through this fence

[Chorus]
Coffee and code
Coffee and code
Stay with me now
Don't let go

Coffee and code
Coffee and code
We make it work
Slow and low

[Verse 2]
I ask the bot for a better path
It spills out clues in a tiny draft
I keep the parts that feel alive
Trim the noise and let it drive

Little hum from the fan in the room
Late-night thoughts in a paper moon
When the bug hides deep in the line
I breathe, I scroll, I try one more time

[Pre-Chorus]
Say it one more time
Make it make sense
AI, help me out
Through this fence

[Chorus]
Coffee and code
Coffee and code
Stay with me now
Don't let go

Coffee and code
Coffee and code
We make it work
Slow and low

[Bridge]
If the world sleeps on
I'm still here
A small bright spark
In the quiet air

One more save
One more try
Then I watch it run
And close my eyes

[Chorus]
Coffee and code
Coffee and code
Stay with me now
Don't let go

Coffee and code
Coffee and code
We make it work
Slow and low`;

const LYRICS_COFFEE = `[Verse 1]
Screen glow on my face
Half a cup gone cold
Cursor blinkin' back
Like it knows my soul

Keys under my fingers
Late-night little spell
AI in the window
Says, "You know this well"

[Pre-Chorus]
I write it down
Then I rewrite
Small bugs, big thoughts
Through the blue hour light

[Chorus]
Coffee and code
Keep me close
Coffee and code
That's my road
AI by my side
Through the quiet glide
Coffee and code
Keep me close

[Verse 2]
Noodles in the sink
Whiteboard full of rain
One more little fix
Then I start again

Window half open
Air on my skin
Dreaming in the margins
Let the night come in

[Pre-Chorus]
I write it down
Then I rewrite
Small bugs, big thoughts
Through the blue hour light

[Chorus]
Coffee and code
Keep me close
Coffee and code
That's my road
AI by my side
Through the quiet glide
Coffee and code
Keep me close

[Bridge]
If I get lost
You help me find
A softer path
Inside my mind

No rush tonight
Just me and you
One more line
Then the sky turns blue

[Chorus]
Coffee and code
Keep me close
Coffee and code
That's my road
AI by my side
Through the quiet glide
Coffee and code
Keep me close`;

export const TRACKS: Track[] = [
  { id: 1,  title: "Instrumental 1",         artist: "AI and Coffee", src: "/music/instrumental/ai-and-coffee-instrumental-1.mp3",   type: "instrumental" },
  { id: 2,  title: "Instrumental v2",        artist: "AI and Coffee", src: "/music/instrumental/ai-and-coffee-instrumental-v2.mp3",  type: "instrumental" },
  { id: 3,  title: "Midnight Compile",       artist: "AI and Coffee", src: "/music/vocal/ai-and-coffee-midnight-compile.mp3",        type: "vocal", lyrics: LYRICS_MIDNIGHT },
  { id: 4,  title: "Midnight Compile v2",    artist: "AI and Coffee", src: "/music/vocal/ai-and-coffee-midnight-compile-v2.mp3",     type: "vocal", lyrics: LYRICS_MIDNIGHT },
  { id: 5,  title: "Coffee and Code",        artist: "AI and Coffee", src: "/music/vocal/coffee-and-code.mp3",                      type: "vocal", lyrics: LYRICS_COFFEE  },
  { id: 6,  title: "Coffee and Code v2",     artist: "AI and Coffee", src: "/music/vocal/coffee-and-code-v2.mp3",                   type: "vocal", lyrics: LYRICS_COFFEE  },
  { id: 7,  title: "Coffee and Comments",    artist: "AI and Coffee", src: "/music/vocal/coffee-and-comments.mp3",                  type: "vocal", lyrics: LYRICS_COFFEE  },
  { id: 8,  title: "Coffee and Comments v2", artist: "AI and Coffee", src: "/music/vocal/coffee-and-comments-v2.mp3",               type: "vocal", lyrics: LYRICS_COFFEE  },
  { id: 9,  title: "Coffee and Compile",     artist: "AI and Coffee", src: "/music/vocal/coffee-and-compile.mp3",                   type: "vocal", lyrics: LYRICS_COFFEE  },
  { id: 10, title: "Coffee and Compile v2",  artist: "AI and Coffee", src: "/music/vocal/coffee-and-compile-v2.mp3",                type: "vocal", lyrics: LYRICS_COFFEE  },
  { id: 11, title: "Halfway Save",           artist: "AI and Coffee", src: "/music/vocal/halfway-save.mp3",                        type: "vocal", lyrics: LYRICS_COFFEE  },
  { id: 12, title: "Halfway Save v2",        artist: "AI and Coffee", src: "/music/vocal/halfway-save-v2.mp3",                     type: "vocal", lyrics: LYRICS_COFFEE  },
];

export function makeShuffled(indices: number[], pin: number): number[] {
  const rest = indices.filter((i) => i !== pin);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [pin, ...rest];
}

export function formatTime(sec: number): string {
  if (!isFinite(sec) || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
