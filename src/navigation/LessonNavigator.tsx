import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Lesson 1 Screens
import { Lesson1Screen1 } from '../screens/lessons/Lesson1Screen1';
import { Lesson1Screen2 } from '../screens/lessons/Lesson1Screen2';
import { Lesson1Screen3 } from '../screens/lessons/Lesson1Screen3';
import { Lesson1Screen4 } from '../screens/lessons/Lesson1Screen4';
import { Lesson1Screen5 } from '../screens/lessons/Lesson1Screen5';
import { Lesson1Screen6 } from '../screens/lessons/Lesson1Screen6';
import { Lesson1Screen7 } from '../screens/lessons/Lesson1Screen7';
import { Lesson1Screen8 } from '../screens/lessons/Lesson1Screen8';
import { Lesson1Screen9 } from '../screens/lessons/Lesson1Screen9';
import { Lesson1Screen10 } from '../screens/lessons/Lesson1Screen10';
import { Lesson1Screen11 } from '../screens/lessons/Lesson1Screen11';
import { Lesson1Quiz } from '../screens/lessons/Lesson1Quiz';
import { Lesson1QuizQ1 } from '../screens/lessons/Lesson1QuizQ1';
import { Lesson1QuizQ2 } from '../screens/lessons/Lesson1QuizQ2';
import { Lesson1QuizQ3 } from '../screens/lessons/Lesson1QuizQ3';
import { Lesson1Complete } from '../screens/lessons/Lesson1Complete';

// Lesson 2 Screens
import { Lesson2Screen1 } from '../screens/lessons/Lesson2Screen1';
import { Lesson2Screen2 } from '../screens/lessons/Lesson2Screen2';
import { Lesson2Screen3 } from '../screens/lessons/Lesson2Screen3';
import { Lesson2Screen4 } from '../screens/lessons/Lesson2Screen4';
import { Lesson2Screen5 } from '../screens/lessons/Lesson2Screen5';
import { Lesson2Screen6 } from '../screens/lessons/Lesson2Screen6';
import { Lesson2Screen7 } from '../screens/lessons/Lesson2Screen7';
import { Lesson2Screen8 } from '../screens/lessons/Lesson2Screen8';
import { Lesson2Screen9 } from '../screens/lessons/Lesson2Screen9';
import { Lesson2Screen10 } from '../screens/lessons/Lesson2Screen10';
import { Lesson2Screen11 } from '../screens/lessons/Lesson2Screen11';
import { Lesson2Screen12 } from '../screens/lessons/Lesson2Screen12';
import { Lesson2Quiz } from '../screens/lessons/Lesson2Quiz';
import { Lesson2QuizQ1 } from '../screens/lessons/Lesson2QuizQ1';
import { Lesson2QuizQ2 } from '../screens/lessons/Lesson2QuizQ2';
import { Lesson2QuizQ3 } from '../screens/lessons/Lesson2QuizQ3';
import { Lesson2Complete } from '../screens/lessons/Lesson2Complete';

// Lesson 3 Screens
import { Lesson3Screen1 } from '../screens/lessons/Lesson3Screen1';
import { Lesson3Screen2 } from '../screens/lessons/Lesson3Screen2';
import { Lesson3Screen3 } from '../screens/lessons/Lesson3Screen3';
import { Lesson3Screen4 } from '../screens/lessons/Lesson3Screen4';
import { Lesson3Screen5 } from '../screens/lessons/Lesson3Screen5';
import { Lesson3Screen6 } from '../screens/lessons/Lesson3Screen6';
import { Lesson3Screen7 } from '../screens/lessons/Lesson3Screen7';
import { Lesson3Screen8 } from '../screens/lessons/Lesson3Screen8';
import { Lesson3Screen9 } from '../screens/lessons/Lesson3Screen9';
import { Lesson3Screen10 } from '../screens/lessons/Lesson3Screen10';
import { Lesson3Screen11 } from '../screens/lessons/Lesson3Screen11';
import { Lesson3Screen12 } from '../screens/lessons/Lesson3Screen12';
import { Lesson3Quiz } from '../screens/lessons/Lesson3Quiz';
import { Lesson3QuizQ1 } from '../screens/lessons/Lesson3QuizQ1';
import { Lesson3QuizQ2 } from '../screens/lessons/Lesson3QuizQ2';
import { Lesson3QuizQ3 } from '../screens/lessons/Lesson3QuizQ3';
import { Lesson3QuizQ4 } from '../screens/lessons/Lesson3QuizQ4';
import { Lesson3QuizQ5 } from '../screens/lessons/Lesson3QuizQ5';
import { Lesson3QuizQ6 } from '../screens/lessons/Lesson3QuizQ6';
import { Lesson3Complete } from '../screens/lessons/Lesson3Complete';

// Lesson 4 Screens
import { Lesson4Screen1 } from '../screens/lessons/Lesson4Screen1';
import { Lesson4Screen2 } from '../screens/lessons/Lesson4Screen2';
import { Lesson4Screen3 } from '../screens/lessons/Lesson4Screen3';
import { Lesson4Screen4 } from '../screens/lessons/Lesson4Screen4';
import { Lesson4Screen5 } from '../screens/lessons/Lesson4Screen5';
import { Lesson4Screen6 } from '../screens/lessons/Lesson4Screen6';
import { Lesson4Screen7 } from '../screens/lessons/Lesson4Screen7';
import { Lesson4Screen8 } from '../screens/lessons/Lesson4Screen8';
import { Lesson4Screen9 } from '../screens/lessons/Lesson4Screen9';
import { Lesson4Screen10 } from '../screens/lessons/Lesson4Screen10';
import { Lesson4Screen11 } from '../screens/lessons/Lesson4Screen11';
import { Lesson4Quiz } from '../screens/lessons/Lesson4Quiz';
import { Lesson4QuizQ1 } from '../screens/lessons/Lesson4QuizQ1';
import { Lesson4QuizQ2 } from '../screens/lessons/Lesson4QuizQ2';
import { Lesson4QuizQ3 } from '../screens/lessons/Lesson4QuizQ3';
import { Lesson4QuizQ4 } from '../screens/lessons/Lesson4QuizQ4';
import { Lesson4QuizQ5 } from '../screens/lessons/Lesson4QuizQ5';
import { Lesson4QuizQ6 } from '../screens/lessons/Lesson4QuizQ6';
import { Lesson4Complete } from '../screens/lessons/Lesson4Complete';

// Lesson 5 Screens - Section 1
import { Lesson5Sec1Screen1 } from '../screens/lessons/Lesson5Sec1Screen1';
import { Lesson5Sec1Screen2 } from '../screens/lessons/Lesson5Sec1Screen2';
import { Lesson5Sec1Screen3 } from '../screens/lessons/Lesson5Sec1Screen3';
import { Lesson5Sec1Screen4 } from '../screens/lessons/Lesson5Sec1Screen4';
import { Lesson5Sec1Screen5 } from '../screens/lessons/Lesson5Sec1Screen5';
import { Lesson5Sec1Screen6 } from '../screens/lessons/Lesson5Sec1Screen6';
import { Lesson5Sec1Screen7 } from '../screens/lessons/Lesson5Sec1Screen7';

// Lesson 5 Screens - Section 2
import { Lesson5Sec2Screen1 } from '../screens/lessons/Lesson5Sec2Screen1';
import { Lesson5Sec2Screen2 } from '../screens/lessons/Lesson5Sec2Screen2';
import { Lesson5Sec2Screen3 } from '../screens/lessons/Lesson5Sec2Screen3';
import { Lesson5Sec2Screen4 } from '../screens/lessons/Lesson5Sec2Screen4';

// Lesson 5 Screens - Section 3
import { Lesson5Sec3Screen1 } from '../screens/lessons/Lesson5Sec3Screen1';
import { Lesson5Sec3Screen2 } from '../screens/lessons/Lesson5Sec3Screen2';
import { Lesson5Sec3Screen3 } from '../screens/lessons/Lesson5Sec3Screen3';
import { Lesson5Sec3Screen4 } from '../screens/lessons/Lesson5Sec3Screen4';
import { Lesson5Sec3Screen5 } from '../screens/lessons/Lesson5Sec3Screen5';
import { Lesson5Sec3Screen6 } from '../screens/lessons/Lesson5Sec3Screen6';
import { Lesson5Sec3Screen7 } from '../screens/lessons/Lesson5Sec3Screen7';
import { Lesson5Sec3Screen8 } from '../screens/lessons/Lesson5Sec3Screen8';

// Lesson 5 Screens - Section 4
import { Lesson5Sec4Screen1 } from '../screens/lessons/Lesson5Sec4Screen1';
import { Lesson5Sec4Screen2 } from '../screens/lessons/Lesson5Sec4Screen2';
import { Lesson5Sec4Screen3 } from '../screens/lessons/Lesson5Sec4Screen3';
import { Lesson5Sec4Screen4 } from '../screens/lessons/Lesson5Sec4Screen4';

// Lesson 5 Complete
import { Lesson5Complete } from '../screens/lessons/Lesson5Complete';

// Naming Emotions - Sub-lesson 1 (Happy)
import { NamingEmotionsSub1Screen1 } from '../screens/naming-emotions/NamingEmotionsSub1Screen1';
import { NamingEmotionsSub1Screen2 } from '../screens/naming-emotions/NamingEmotionsSub1Screen2';
import { NamingEmotionsSub1Screen3 } from '../screens/naming-emotions/NamingEmotionsSub1Screen3';
import { NamingEmotionsSub1Screen4 } from '../screens/naming-emotions/NamingEmotionsSub1Screen4';
import { NamingEmotionsSub1Screen5 } from '../screens/naming-emotions/NamingEmotionsSub1Screen5';
import { NamingEmotionsSub1Screen6 } from '../screens/naming-emotions/NamingEmotionsSub1Screen6';

// Naming Emotions - Sub-lesson 2 (Sad)
import { NamingEmotionsSub2Screen1 } from '../screens/naming-emotions/NamingEmotionsSub2Screen1';
import { NamingEmotionsSub2Screen2 } from '../screens/naming-emotions/NamingEmotionsSub2Screen2';
import { NamingEmotionsSub2Screen3 } from '../screens/naming-emotions/NamingEmotionsSub2Screen3';
import { NamingEmotionsSub2Screen4 } from '../screens/naming-emotions/NamingEmotionsSub2Screen4';
import { NamingEmotionsSub2Screen5 } from '../screens/naming-emotions/NamingEmotionsSub2Screen5';
import { NamingEmotionsSub2Screen6 } from '../screens/naming-emotions/NamingEmotionsSub2Screen6';

// Naming Emotions - Sub-lesson 3 (Mad)
import { NamingEmotionsSub3Screen1 } from '../screens/naming-emotions/NamingEmotionsSub3Screen1';
import { NamingEmotionsSub3Screen2 } from '../screens/naming-emotions/NamingEmotionsSub3Screen2';
import { NamingEmotionsSub3Screen3 } from '../screens/naming-emotions/NamingEmotionsSub3Screen3';
import { NamingEmotionsSub3Screen4 } from '../screens/naming-emotions/NamingEmotionsSub3Screen4';
import { NamingEmotionsSub3Screen5 } from '../screens/naming-emotions/NamingEmotionsSub3Screen5';
import { NamingEmotionsSub3Screen6 } from '../screens/naming-emotions/NamingEmotionsSub3Screen6';

// Naming Emotions - Sub-lesson 4 (Bad)
import { NamingEmotionsSub4Screen1 } from '../screens/naming-emotions/NamingEmotionsSub4Screen1';
import { NamingEmotionsSub4Screen2 } from '../screens/naming-emotions/NamingEmotionsSub4Screen2';
import { NamingEmotionsSub4Screen3 } from '../screens/naming-emotions/NamingEmotionsSub4Screen3';
import { NamingEmotionsSub4Screen4 } from '../screens/naming-emotions/NamingEmotionsSub4Screen4';
import { NamingEmotionsSub4Screen5 } from '../screens/naming-emotions/NamingEmotionsSub4Screen5';
import { NamingEmotionsSub4Screen6 } from '../screens/naming-emotions/NamingEmotionsSub4Screen6';

// Sprinklers - Sub-lesson 1
import { SprinklersSec1Screen1 } from '../screens/sprinklers/SprinklersSec1Screen1';
import { SprinklersSec1Screen2 } from '../screens/sprinklers/SprinklersSec1Screen2';
import { SprinklersSec1Screen3 } from '../screens/sprinklers/SprinklersSec1Screen3';
import { SprinklersSec1Screen4 } from '../screens/sprinklers/SprinklersSec1Screen4';
import { SprinklersSec1Screen5 } from '../screens/sprinklers/SprinklersSec1Screen5';
import { SprinklersSec1Screen6 } from '../screens/sprinklers/SprinklersSec1Screen6';
import { SprinklersSec1Screen7 } from '../screens/sprinklers/SprinklersSec1Screen7';
import { SprinklersSec1Screen8 } from '../screens/sprinklers/SprinklersSec1Screen8';
import { SprinklersSec1Screen9 } from '../screens/sprinklers/SprinklersSec1Screen9';
import { SprinklersSec1Screen10 } from '../screens/sprinklers/SprinklersSec1Screen10';

// Sprinklers - Sub-lesson 2
import { SprinklersSec2Screen1 } from '../screens/sprinklers/SprinklersSec2Screen1';
import { SprinklersSec2Screen2 } from '../screens/sprinklers/SprinklersSec2Screen2';
import { SprinklersSec2Screen3 } from '../screens/sprinklers/SprinklersSec2Screen3';
import { SprinklersSec2Screen4 } from '../screens/sprinklers/SprinklersSec2Screen4';
import { SprinklersSec2Screen5 } from '../screens/sprinklers/SprinklersSec2Screen5';
import { SprinklersSec2Screen6 } from '../screens/sprinklers/SprinklersSec2Screen6';
import { SprinklersSec2Screen7 } from '../screens/sprinklers/SprinklersSec2Screen7';
import { SprinklersSec2Screen8 } from '../screens/sprinklers/SprinklersSec2Screen8';
import { SprinklersSec2Screen9 } from '../screens/sprinklers/SprinklersSec2Screen9';
import { SprinklersSec2Screen10 } from '../screens/sprinklers/SprinklersSec2Screen10';
import { SprinklersSec2Screen11 } from '../screens/sprinklers/SprinklersSec2Screen11';
import { SprinklersSec2Screen12 } from '../screens/sprinklers/SprinklersSec2Screen12';
import { SprinklersSec2Screen13 } from '../screens/sprinklers/SprinklersSec2Screen13';

// Sprinklers - Sub-lesson 3
import { SprinklersSec3Screen1 } from '../screens/sprinklers/SprinklersSec3Screen1';
import { SprinklersSec3Screen2 } from '../screens/sprinklers/SprinklersSec3Screen2';
import { SprinklersSec3Screen3 } from '../screens/sprinklers/SprinklersSec3Screen3';
import { SprinklersSec3Screen4 } from '../screens/sprinklers/SprinklersSec3Screen4';
import { SprinklersSec3Screen5 } from '../screens/sprinklers/SprinklersSec3Screen5';
import { SprinklersSec3Screen6 } from '../screens/sprinklers/SprinklersSec3Screen6';
import { SprinklersSec3Screen7 } from '../screens/sprinklers/SprinklersSec3Screen7';
import { SprinklersSec3Screen8 } from '../screens/sprinklers/SprinklersSec3Screen8';
import { SprinklersSec3Screen9 } from '../screens/sprinklers/SprinklersSec3Screen9';
import { SprinklersSec3Screen10 } from '../screens/sprinklers/SprinklersSec3Screen10';
import { SprinklersSec3Screen11 } from '../screens/sprinklers/SprinklersSec3Screen11';
import { SprinklersSec3Screen12 } from '../screens/sprinklers/SprinklersSec3Screen12';
import { SprinklersSec3Screen13 } from '../screens/sprinklers/SprinklersSec3Screen13';
import { SprinklersSec3Screen14 } from '../screens/sprinklers/SprinklersSec3Screen14';

// Sprinklers - Sub-lesson 4
import { SprinklersSec4Screen1 } from '../screens/sprinklers/SprinklersSec4Screen1';
import { SprinklersSec4Screen2 } from '../screens/sprinklers/SprinklersSec4Screen2';
import { SprinklersSec4Screen3 } from '../screens/sprinklers/SprinklersSec4Screen3';
import { SprinklersSec4Screen4 } from '../screens/sprinklers/SprinklersSec4Screen4';
import { SprinklersSec4Screen5 } from '../screens/sprinklers/SprinklersSec4Screen5';
import { SprinklersSec4Screen6 } from '../screens/sprinklers/SprinklersSec4Screen6';
import { SprinklersSec4Screen7 } from '../screens/sprinklers/SprinklersSec4Screen7';
import { SprinklersSec4Screen8 } from '../screens/sprinklers/SprinklersSec4Screen8';
import { SprinklersSec4Screen9 } from '../screens/sprinklers/SprinklersSec4Screen9';

// Sprinklers - Sub-lesson 5
import { SprinklersSec5Screen1 } from '../screens/sprinklers/SprinklersSec5Screen1';
import { SprinklersSec5Screen2 } from '../screens/sprinklers/SprinklersSec5Screen2';
import { SprinklersSec5Screen3 } from '../screens/sprinklers/SprinklersSec5Screen3';
import { SprinklersSec5Screen4 } from '../screens/sprinklers/SprinklersSec5Screen4';
import { SprinklersSec5Screen5 } from '../screens/sprinklers/SprinklersSec5Screen5';
import { SprinklersSec5Screen6 } from '../screens/sprinklers/SprinklersSec5Screen6';
import { SprinklersSec5Screen7 } from '../screens/sprinklers/SprinklersSec5Screen7';

// Emotional Sandbags - Sub-lesson 1
import { SandbagsSec1Screen1 } from '../screens/emotional-sandbags/SandbagsSec1Screen1';
import { SandbagsSec1Screen2 } from '../screens/emotional-sandbags/SandbagsSec1Screen2';
import { SandbagsSec1Screen3 } from '../screens/emotional-sandbags/SandbagsSec1Screen3';

// Emotional Sandbags - Sub-lesson 2
import { SandbagsSec2Screen1 } from '../screens/emotional-sandbags/SandbagsSec2Screen1';
import { SandbagsSec2Screen2 } from '../screens/emotional-sandbags/SandbagsSec2Screen2';
import { SandbagsSec2Screen3 } from '../screens/emotional-sandbags/SandbagsSec2Screen3';
import { SandbagsSec2Screen4 } from '../screens/emotional-sandbags/SandbagsSec2Screen4';
import { SandbagsSec2Screen5 } from '../screens/emotional-sandbags/SandbagsSec2Screen5';
import { SandbagsSec2Screen6 } from '../screens/emotional-sandbags/SandbagsSec2Screen6';
import { SandbagsSec2Screen7 } from '../screens/emotional-sandbags/SandbagsSec2Screen7';
import { SandbagsSec2Screen8 } from '../screens/emotional-sandbags/SandbagsSec2Screen8';
import { SandbagsSec2Screen9 } from '../screens/emotional-sandbags/SandbagsSec2Screen9';
import { SandbagsSec2Screen10 } from '../screens/emotional-sandbags/SandbagsSec2Screen10';

// Emotional Sandbags - Sub-lesson 3
import { EmotionalSandbagsSec3Screen1 } from '../screens/emotional-sandbags/EmotionalSandbagsSec3Screen1';
import { EmotionalSandbagsSec3Screen2 } from '../screens/emotional-sandbags/EmotionalSandbagsSec3Screen2';
import { EmotionalSandbagsSec3Screen3 } from '../screens/emotional-sandbags/EmotionalSandbagsSec3Screen3';
import { EmotionalSandbagsSec3Screen4 } from '../screens/emotional-sandbags/EmotionalSandbagsSec3Screen4';
import { EmotionalSandbagsSec3Screen5 } from '../screens/emotional-sandbags/EmotionalSandbagsSec3Screen5';
import { EmotionalSandbagsSec3Screen6 } from '../screens/emotional-sandbags/EmotionalSandbagsSec3Screen6';
import { EmotionalSandbagsSec3Screen7 } from '../screens/emotional-sandbags/EmotionalSandbagsSec3Screen7';
import { EmotionalSandbagsSec3Screen8 } from '../screens/emotional-sandbags/EmotionalSandbagsSec3Screen8';
import { EmotionalSandbagsSec3Screen9 } from '../screens/emotional-sandbags/EmotionalSandbagsSec3Screen9';
import { EmotionalSandbagsSec3Screen10 } from '../screens/emotional-sandbags/EmotionalSandbagsSec3Screen10';

// Emotional Sandbags - Sub-lesson 4
import { EmotionalSandbagsSec4Screen1 } from '../screens/emotional-sandbags/EmotionalSandbagsSec4Screen1';
import { EmotionalSandbagsSec4Screen2 } from '../screens/emotional-sandbags/EmotionalSandbagsSec4Screen2';
import { EmotionalSandbagsSec4Screen3 } from '../screens/emotional-sandbags/EmotionalSandbagsSec4Screen3';
import { EmotionalSandbagsSec4Screen4 } from '../screens/emotional-sandbags/EmotionalSandbagsSec4Screen4';
import { EmotionalSandbagsSec4Screen5 } from '../screens/emotional-sandbags/EmotionalSandbagsSec4Screen5';
import { EmotionalSandbagsSec4Screen6 } from '../screens/emotional-sandbags/EmotionalSandbagsSec4Screen6';
import { EmotionalSandbagsSec4Screen7 } from '../screens/emotional-sandbags/EmotionalSandbagsSec4Screen7';
import { EmotionalSandbagsSec4Screen8 } from '../screens/emotional-sandbags/EmotionalSandbagsSec4Screen8';

// Emotional Sandbags - Sub-lesson 5
import { EmotionalSandbagsSec5Screen1 } from '../screens/emotional-sandbags/EmotionalSandbagsSec5Screen1';
import { EmotionalSandbagsSec5Screen2 } from '../screens/emotional-sandbags/EmotionalSandbagsSec5Screen2';
import { EmotionalSandbagsSec5Screen3 } from '../screens/emotional-sandbags/EmotionalSandbagsSec5Screen3';
import { EmotionalSandbagsSec5Screen4 } from '../screens/emotional-sandbags/EmotionalSandbagsSec5Screen4';
import { EmotionalSandbagsSec5Screen5 } from '../screens/emotional-sandbags/EmotionalSandbagsSec5Screen5';
import { EmotionalSandbagsSec5Screen6 } from '../screens/emotional-sandbags/EmotionalSandbagsSec5Screen6';
import { EmotionalSandbagsSec5Screen7 } from '../screens/emotional-sandbags/EmotionalSandbagsSec5Screen7';
import { EmotionalSandbagsSec5Screen8 } from '../screens/emotional-sandbags/EmotionalSandbagsSec5Screen8';
import { EmotionalSandbagsSec5Screen9 } from '../screens/emotional-sandbags/EmotionalSandbagsSec5Screen9';
import { EmotionalSandbagsSec5Screen10 } from '../screens/emotional-sandbags/EmotionalSandbagsSec5Screen10';

// Emotional Sandbags - Sub-lesson 6
import { EmotionalSandbagsSec6Screen1 } from '../screens/emotional-sandbags/EmotionalSandbagsSec6Screen1';
import { EmotionalSandbagsSec6Screen2 } from '../screens/emotional-sandbags/EmotionalSandbagsSec6Screen2';
import { EmotionalSandbagsSec6Screen3 } from '../screens/emotional-sandbags/EmotionalSandbagsSec6Screen3';
import { EmotionalSandbagsSec6Screen4 } from '../screens/emotional-sandbags/EmotionalSandbagsSec6Screen4';
import { EmotionalSandbagsSec6Screen5 } from '../screens/emotional-sandbags/EmotionalSandbagsSec6Screen5';
import { EmotionalSandbagsSec6Screen6 } from '../screens/emotional-sandbags/EmotionalSandbagsSec6Screen6';

// Communication Mistakes - Sub-lesson 1
import { CommunicationMistakesSec1Screen1 } from '../screens/communication-mistakes/CommunicationMistakesSec1Screen1';
import { CommunicationMistakesSec1Screen2 } from '../screens/communication-mistakes/CommunicationMistakesSec1Screen2';
import { CommunicationMistakesSec1Screen3 } from '../screens/communication-mistakes/CommunicationMistakesSec1Screen3';
import { CommunicationMistakesSec1Screen4 } from '../screens/communication-mistakes/CommunicationMistakesSec1Screen4';
import { CommunicationMistakesSec1Screen5 } from '../screens/communication-mistakes/CommunicationMistakesSec1Screen5';
import { CommunicationMistakesSec1Screen6 } from '../screens/communication-mistakes/CommunicationMistakesSec1Screen6';

// Communication Mistakes - Sub-lesson 2
import { CommunicationMistakesSec2Screen1 } from '../screens/communication-mistakes/CommunicationMistakesSec2Screen1';
import { CommunicationMistakesSec2Screen2 } from '../screens/communication-mistakes/CommunicationMistakesSec2Screen2';
import { CommunicationMistakesSec2Screen3 } from '../screens/communication-mistakes/CommunicationMistakesSec2Screen3';
import { CommunicationMistakesSec2Screen4 } from '../screens/communication-mistakes/CommunicationMistakesSec2Screen4';
import { CommunicationMistakesSec2Screen5 } from '../screens/communication-mistakes/CommunicationMistakesSec2Screen5';
import { CommunicationMistakesSec2Screen6 } from '../screens/communication-mistakes/CommunicationMistakesSec2Screen6';
import { CommunicationMistakesSec2Screen7 } from '../screens/communication-mistakes/CommunicationMistakesSec2Screen7';
import { CommunicationMistakesSec2Screen8 } from '../screens/communication-mistakes/CommunicationMistakesSec2Screen8';
import { CommunicationMistakesSec2Screen9 } from '../screens/communication-mistakes/CommunicationMistakesSec2Screen9';

// Communication Mistakes - Sub-lesson 3
import { CommunicationMistakesSec3Screen1 } from '../screens/communication-mistakes/CommunicationMistakesSec3Screen1';
import { CommunicationMistakesSec3Screen2 } from '../screens/communication-mistakes/CommunicationMistakesSec3Screen2';
import { CommunicationMistakesSec3Screen3 } from '../screens/communication-mistakes/CommunicationMistakesSec3Screen3';
import { CommunicationMistakesSec3Screen4 } from '../screens/communication-mistakes/CommunicationMistakesSec3Screen4';
import { CommunicationMistakesSec3Screen5 } from '../screens/communication-mistakes/CommunicationMistakesSec3Screen5';
import { CommunicationMistakesSec3Screen6 } from '../screens/communication-mistakes/CommunicationMistakesSec3Screen6';

// Communication Mistakes - Sub-lesson 4
import { CommunicationMistakesSec4Screen1 } from '../screens/communicationMistakes/CommunicationMistakesSec4Screen1';
import { CommunicationMistakesSec4Screen2 } from '../screens/communicationMistakes/CommunicationMistakesSec4Screen2';
import { CommunicationMistakesSec4Screen3 } from '../screens/communicationMistakes/CommunicationMistakesSec4Screen3';
import { CommunicationMistakesSec4Screen4 } from '../screens/communicationMistakes/CommunicationMistakesSec4Screen4';

// Communication Mistakes - Sub-lesson 5
import { CommunicationMistakesSec5Screen1 } from '../screens/communicationMistakes/CommunicationMistakesSec5Screen1';
import { CommunicationMistakesSec5Screen2 } from '../screens/communicationMistakes/CommunicationMistakesSec5Screen2';
import { CommunicationMistakesSec5Screen3 } from '../screens/communicationMistakes/CommunicationMistakesSec5Screen3';
import { CommunicationMistakesSec5Screen4 } from '../screens/communicationMistakes/CommunicationMistakesSec5Screen4';
import { CommunicationMistakesSec5Screen5 } from '../screens/communicationMistakes/CommunicationMistakesSec5Screen5';
import { CommunicationMistakesSec5Screen6 } from '../screens/communicationMistakes/CommunicationMistakesSec5Screen6';
import { CommunicationMistakesSec5Screen7 } from '../screens/communicationMistakes/CommunicationMistakesSec5Screen7';

// Communication Mistakes - Sub-lesson 6
import { CommunicationMistakesSec6Screen1 } from '../screens/communicationMistakes/CommunicationMistakesSec6Screen1';
import { CommunicationMistakesSec6Screen2 } from '../screens/communicationMistakes/CommunicationMistakesSec6Screen2';
import { CommunicationMistakesSec6Screen3 } from '../screens/communicationMistakes/CommunicationMistakesSec6Screen3';

// Communication Mistakes - Sub-lesson 7
import { CommunicationMistakesSec7Screen1 } from '../screens/communicationMistakes/CommunicationMistakesSec7Screen1';
import { CommunicationMistakesSec7Screen2 } from '../screens/communicationMistakes/CommunicationMistakesSec7Screen2';

// Communication Mistakes - Sub-lesson 8
import { CommunicationMistakesSec8Screen1 } from '../screens/communicationMistakes/CommunicationMistakesSec8Screen1';
import { CommunicationMistakesSec8Screen2 } from '../screens/communicationMistakes/CommunicationMistakesSec8Screen2';
import { CommunicationMistakesSec8Screen3 } from '../screens/communicationMistakes/CommunicationMistakesSec8Screen3';

// Communication Mistakes - Sub-lesson 9
import { CommunicationMistakesSec9Screen1 } from '../screens/communicationMistakes/CommunicationMistakesSec9Screen1';

// Communication Mistakes - Sub-lesson 10
import { CommunicationMistakesSec10Screen1 } from '../screens/communicationMistakes/CommunicationMistakesSec10Screen1';
import { CommunicationMistakesSec10Screen2 } from '../screens/communicationMistakes/CommunicationMistakesSec10Screen2';
import { CommunicationMistakesSec10Screen3 } from '../screens/communicationMistakes/CommunicationMistakesSec10Screen3';

// Communication Mistakes - Sub-lesson 11
import { CommunicationMistakesSec11Screen1 } from '../screens/communicationMistakes/CommunicationMistakesSec11Screen1';
import { CommunicationMistakesSec11Screen2 } from '../screens/communicationMistakes/CommunicationMistakesSec11Screen2';
import { CommunicationMistakesSec11Screen3 } from '../screens/communicationMistakes/CommunicationMistakesSec11Screen3';
import { CommunicationMistakesSec11Screen4 } from '../screens/communicationMistakes/CommunicationMistakesSec11Screen4';

// Communication Mistakes - Sub-lesson 12
import { CommunicationMistakesSec12Screen1 } from '../screens/communicationMistakes/CommunicationMistakesSec12Screen1';
import { CommunicationMistakesSec12Screen2 } from '../screens/communicationMistakes/CommunicationMistakesSec12Screen2';
import { CommunicationMistakesSec12Screen3 } from '../screens/communicationMistakes/CommunicationMistakesSec12Screen3';
import { CommunicationMistakesSec12Screen4 } from '../screens/communicationMistakes/CommunicationMistakesSec12Screen4';
import { CommunicationMistakesSec12Screen5 } from '../screens/communicationMistakes/CommunicationMistakesSec12Screen5';
import { CommunicationMistakesSec12Screen6 } from '../screens/communicationMistakes/CommunicationMistakesSec12Screen6';

// Communication Mistakes - Sub-lesson 13
import { CommunicationMistakesSec13Screen1 } from '../screens/communicationMistakes/CommunicationMistakesSec13Screen1';
import { CommunicationMistakesSec13Screen2 } from '../screens/communicationMistakes/CommunicationMistakesSec13Screen2';
import { CommunicationMistakesSec13Screen3 } from '../screens/communicationMistakes/CommunicationMistakesSec13Screen3';
import { CommunicationMistakesSec13Screen4 } from '../screens/communicationMistakes/CommunicationMistakesSec13Screen4';
import { CommunicationMistakesSec13Screen5 } from '../screens/communicationMistakes/CommunicationMistakesSec13Screen5';

// Helping Process Emotions - Sub-lesson 1
import { HelpingProcessEmotionsSec1Screen1 } from '../screens/helpingProcessEmotions/HelpingProcessEmotionsSec1Screen1';

// Helping Process Emotions - Sub-lesson 2
import { HelpingProcessEmotionsSec2Screen1 } from '../screens/helpingProcessEmotions/HelpingProcessEmotionsSec2Screen1';
import { HelpingProcessEmotionsSec2Screen2 } from '../screens/helpingProcessEmotions/HelpingProcessEmotionsSec2Screen2';
import { HelpingProcessEmotionsSec2Screen3 } from '../screens/helpingProcessEmotions/HelpingProcessEmotionsSec2Screen3';
import { HelpingProcessEmotionsSec2Screen4 } from '../screens/helpingProcessEmotions/HelpingProcessEmotionsSec2Screen4';
import { HelpingProcessEmotionsSec2Screen5 } from '../screens/helpingProcessEmotions/HelpingProcessEmotionsSec2Screen5';
import { HelpingProcessEmotionsSec2Screen6 } from '../screens/helpingProcessEmotions/HelpingProcessEmotionsSec2Screen6';
import { HelpingProcessEmotionsSec2Screen7 } from '../screens/helpingProcessEmotions/HelpingProcessEmotionsSec2Screen7';
import { HelpingProcessEmotionsSec2Screen8 } from '../screens/helpingProcessEmotions/HelpingProcessEmotionsSec2Screen8';
import { HelpingProcessEmotionsSec2Screen9 } from '../screens/helpingProcessEmotions/HelpingProcessEmotionsSec2Screen9';
import { HelpingProcessEmotionsSec2Screen10 } from '../screens/helpingProcessEmotions/HelpingProcessEmotionsSec2Screen10';

// Serve & Return Lesson
import { ServeReturnLessonScreen } from '../screens/ServeReturnLessonScreen';

// Serve & Return - Sub-lesson 1
import { ServeReturnSec1Screen1 } from '../screens/serveReturn/ServeReturnSec1Screen1';
import { ServeReturnSec1Screen2 } from '../screens/serveReturn/ServeReturnSec1Screen2';
import { ServeReturnSec1Screen3 } from '../screens/serveReturn/ServeReturnSec1Screen3';
import { ServeReturnSec1Screen4 } from '../screens/serveReturn/ServeReturnSec1Screen4';

// Serve & Return - Sub-lesson 2
import { ServeReturnSec2Screen1 } from '../screens/serveReturn/ServeReturnSec2Screen1';
import { ServeReturnSec2Screen2 } from '../screens/serveReturn/ServeReturnSec2Screen2';
import { ServeReturnSec2Screen3 } from '../screens/serveReturn/ServeReturnSec2Screen3';
import { ServeReturnSec2Screen4 } from '../screens/serveReturn/ServeReturnSec2Screen4';

// Serve & Return - Sub-lesson 3
import { ServeReturnSec3Screen1 } from '../screens/serveReturn/ServeReturnSec3Screen1';
import { ServeReturnSec3Screen2 } from '../screens/serveReturn/ServeReturnSec3Screen2';
import { ServeReturnSec3Screen3 } from '../screens/serveReturn/ServeReturnSec3Screen3';
import { ServeReturnSec3Screen4 } from '../screens/serveReturn/ServeReturnSec3Screen4';
import { ServeReturnSec3Screen5 } from '../screens/serveReturn/ServeReturnSec3Screen5';

// Serve & Return - Sub-lesson 4
import { ServeReturnSec4Screen1 } from '../screens/serveReturn/ServeReturnSec4Screen1';
import { ServeReturnSec4Screen2 } from '../screens/serveReturn/ServeReturnSec4Screen2';
import { ServeReturnSec4Screen3 } from '../screens/serveReturn/ServeReturnSec4Screen3';

// Serve & Return - Sub-lesson 5
import { ServeReturnSec5Screen1 } from '../screens/serveReturn/ServeReturnSec5Screen1';
import { ServeReturnSec5Screen2 } from '../screens/serveReturn/ServeReturnSec5Screen2';
import { ServeReturnSec5Screen3 } from '../screens/serveReturn/ServeReturnSec5Screen3';

// Serve & Return - Sub-lesson 6
import { ServeReturnSec6Screen1 } from '../screens/serveReturn/ServeReturnSec6Screen1';
import { ServeReturnSec6Screen2 } from '../screens/serveReturn/ServeReturnSec6Screen2';
import { ServeReturnSec6Screen3 } from '../screens/serveReturn/ServeReturnSec6Screen3';

// Recording Deep Bond Moments - Sub-lesson 1
import { RecordingDeepBondMomentsSec1Screen1 } from '../screens/recordingDeepBondMoments/RecordingDeepBondMomentsSec1Screen1';
import { RecordingDeepBondMomentsSec1Screen2 } from '../screens/recordingDeepBondMoments/RecordingDeepBondMomentsSec1Screen2';
import { RecordingDeepBondMomentsSec1Screen3 } from '../screens/recordingDeepBondMoments/RecordingDeepBondMomentsSec1Screen3';
import { RecordingDeepBondMomentsSec1Screen4 } from '../screens/recordingDeepBondMoments/RecordingDeepBondMomentsSec1Screen4';
import { RecordingDeepBondMomentsSec1Screen5 } from '../screens/recordingDeepBondMoments/RecordingDeepBondMomentsSec1Screen5';
import { RecordingDeepBondMomentsSec1Screen6 } from '../screens/recordingDeepBondMoments/RecordingDeepBondMomentsSec1Screen6';

// Dissociation - Sub-lesson 1
import { DissociationSec1Screen1 } from '../screens/dissociation/DissociationSec1Screen1';
import { DissociationSec1Screen2 } from '../screens/dissociation/DissociationSec1Screen2';
import { DissociationSec1Screen3 } from '../screens/dissociation/DissociationSec1Screen3';
import { DissociationSec1Screen4 } from '../screens/dissociation/DissociationSec1Screen4';
import { DissociationSec1Screen5 } from '../screens/dissociation/DissociationSec1Screen5';
import { DissociationSec1Screen6 } from '../screens/dissociation/DissociationSec1Screen6';
import { DissociationSec1Screen7 } from '../screens/dissociation/DissociationSec1Screen7';

// Dissociation - Sub-lesson 2
import { DissociationSec2Screen1 } from '../screens/dissociation/DissociationSec2Screen1';
import { DissociationSec2Screen2 } from '../screens/dissociation/DissociationSec2Screen2';
import { DissociationSec2Screen3 } from '../screens/dissociation/DissociationSec2Screen3';
import { DissociationSec2Screen4 } from '../screens/dissociation/DissociationSec2Screen4';
import { DissociationSec2Screen5 } from '../screens/dissociation/DissociationSec2Screen5';
import { DissociationSec2Screen6 } from '../screens/dissociation/DissociationSec2Screen6';

// Dissociation - Sub-lesson 3
import { DissociationSec3Screen1 } from '../screens/dissociation/DissociationSec3Screen1';
import { DissociationSec3Screen2 } from '../screens/dissociation/DissociationSec3Screen2';
import { DissociationSec3Screen3 } from '../screens/dissociation/DissociationSec3Screen3';
import { DissociationSec3Screen4 } from '../screens/dissociation/DissociationSec3Screen4';
import { DissociationSec3Screen5 } from '../screens/dissociation/DissociationSec3Screen5';
import { DissociationSec3Screen6 } from '../screens/dissociation/DissociationSec3Screen6';
import { DissociationSec3Screen7 } from '../screens/dissociation/DissociationSec3Screen7';
import { DissociationSec3Screen8 } from '../screens/dissociation/DissociationSec3Screen8';
import { DissociationSec3Screen9 } from '../screens/dissociation/DissociationSec3Screen9';

// Dissociation - Sub-lesson 4
import { DissociationSec4Screen1 } from '../screens/dissociation/DissociationSec4Screen1';
import { DissociationSec4Screen2 } from '../screens/dissociation/DissociationSec4Screen2';
import { DissociationSec4Screen3 } from '../screens/dissociation/DissociationSec4Screen3';

export type LessonStackParamList = {
  Lesson1Screen1: undefined;
  Lesson1Screen2: undefined;
  Lesson1Screen3: undefined;
  Lesson1Screen4: undefined;
  Lesson1Screen5: undefined;
  Lesson1Screen6: undefined;
  Lesson1Screen7: undefined;
  Lesson1Screen8: undefined;
  Lesson1Screen9: undefined;
  Lesson1Screen10: undefined;
  Lesson1Screen11: undefined;
  Lesson1Quiz: undefined;
  Lesson1QuizQ1: undefined;
  Lesson1QuizQ2: undefined;
  Lesson1QuizQ3: undefined;
  Lesson1Complete: undefined;
  Lesson2Screen1: undefined;
  Lesson2Screen2: undefined;
  Lesson2Screen3: undefined;
  Lesson2Screen4: undefined;
  Lesson2Screen5: undefined;
  Lesson2Screen6: undefined;
  Lesson2Screen7: undefined;
  Lesson2Screen8: undefined;
  Lesson2Screen9: undefined;
  Lesson2Screen10: undefined;
  Lesson2Screen11: undefined;
  Lesson2Screen12: undefined;
  Lesson2Quiz: undefined;
  Lesson2QuizQ1: undefined;
  Lesson2QuizQ2: undefined;
  Lesson2QuizQ3: undefined;
  Lesson2Complete: undefined;
  Lesson3Screen1: undefined;
  Lesson3Screen2: undefined;
  Lesson3Screen3: undefined;
  Lesson3Screen4: undefined;
  Lesson3Screen5: undefined;
  Lesson3Screen6: undefined;
  Lesson3Screen7: undefined;
  Lesson3Screen8: undefined;
  Lesson3Screen9: undefined;
  Lesson3Screen10: undefined;
  Lesson3Screen11: undefined;
  Lesson3Screen12: undefined;
  Lesson3Quiz: undefined;
  Lesson3QuizQ1: undefined;
  Lesson3QuizQ2: undefined;
  Lesson3QuizQ3: undefined;
  Lesson3QuizQ4: undefined;
  Lesson3QuizQ5: undefined;
  Lesson3QuizQ6: undefined;
  Lesson3Complete: undefined;
  Lesson4Screen1: undefined;
  Lesson4Screen2: undefined;
  Lesson4Screen3: undefined;
  Lesson4Screen4: undefined;
  Lesson4Screen5: undefined;
  Lesson4Screen6: undefined;
  Lesson4Screen7: undefined;
  Lesson4Screen8: undefined;
  Lesson4Screen9: undefined;
  Lesson4Screen10: undefined;
  Lesson4Screen11: undefined;
  Lesson4Quiz: undefined;
  Lesson4QuizQ1: undefined;
  Lesson4QuizQ2: undefined;
  Lesson4QuizQ3: undefined;
  Lesson4QuizQ4: undefined;
  Lesson4QuizQ5: undefined;
  Lesson4QuizQ6: undefined;
  Lesson4Complete: undefined;
  Lesson5Sec1Screen1: undefined;
  Lesson5Sec1Screen2: undefined;
  Lesson5Sec1Screen3: undefined;
  Lesson5Sec1Screen4: undefined;
  Lesson5Sec1Screen5: undefined;
  Lesson5Sec1Screen6: undefined;
  Lesson5Sec1Screen7: undefined;
  Lesson5Sec2Screen1: undefined;
  Lesson5Sec2Screen2: undefined;
  Lesson5Sec2Screen3: undefined;
  Lesson5Sec2Screen4: undefined;
  Lesson5Sec3Screen1: undefined;
  Lesson5Sec3Screen2: undefined;
  Lesson5Sec3Screen3: undefined;
  Lesson5Sec3Screen4: undefined;
  Lesson5Sec3Screen5: undefined;
  Lesson5Sec3Screen6: undefined;
  Lesson5Sec3Screen7: undefined;
  Lesson5Sec3Screen8: undefined;
  Lesson5Sec4Screen1: undefined;
  Lesson5Sec4Screen2: undefined;
  Lesson5Sec4Screen3: undefined;
  Lesson5Sec4Screen4: undefined;
  Lesson5Complete: undefined;
  NamingEmotionsSub1Screen1: undefined;
  NamingEmotionsSub1Screen2: undefined;
  NamingEmotionsSub1Screen3: undefined;
  NamingEmotionsSub1Screen4: undefined;
  NamingEmotionsSub1Screen5: undefined;
  NamingEmotionsSub1Screen6: undefined;
  NamingEmotionsSub2Screen1: undefined;
  NamingEmotionsSub2Screen2: undefined;
  NamingEmotionsSub2Screen3: undefined;
  NamingEmotionsSub2Screen4: undefined;
  NamingEmotionsSub2Screen5: undefined;
  NamingEmotionsSub2Screen6: undefined;
  NamingEmotionsSub3Screen1: undefined;
  NamingEmotionsSub3Screen2: undefined;
  NamingEmotionsSub3Screen3: undefined;
  NamingEmotionsSub3Screen4: undefined;
  NamingEmotionsSub3Screen5: undefined;
  NamingEmotionsSub3Screen6: undefined;
  NamingEmotionsSub4Screen1: undefined;
  NamingEmotionsSub4Screen2: undefined;
  NamingEmotionsSub4Screen3: undefined;
  NamingEmotionsSub4Screen4: undefined;
  NamingEmotionsSub4Screen5: undefined;
  NamingEmotionsSub4Screen6: undefined;
  SprinklersSec1Screen1: undefined;
  SprinklersSec1Screen2: undefined;
  SprinklersSec1Screen3: undefined;
  SprinklersSec1Screen4: undefined;
  SprinklersSec1Screen5: undefined;
  SprinklersSec1Screen6: undefined;
  SprinklersSec1Screen7: undefined;
  SprinklersSec1Screen8: undefined;
  SprinklersSec1Screen9: undefined;
  SprinklersSec1Screen10: undefined;
  SprinklersSec2Screen1: undefined;
  SprinklersSec2Screen2: undefined;
  SprinklersSec2Screen3: undefined;
  SprinklersSec2Screen4: undefined;
  SprinklersSec2Screen5: undefined;
  SprinklersSec2Screen6: undefined;
  SprinklersSec2Screen7: undefined;
  SprinklersSec2Screen8: undefined;
  SprinklersSec2Screen9: undefined;
  SprinklersSec2Screen10: undefined;
  SprinklersSec2Screen11: undefined;
  SprinklersSec2Screen12: undefined;
  SprinklersSec2Screen13: undefined;
  SprinklersSec3Screen1: undefined;
  SprinklersSec3Screen2: undefined;
  SprinklersSec3Screen3: undefined;
  SprinklersSec3Screen4: undefined;
  SprinklersSec3Screen5: undefined;
  SprinklersSec3Screen6: undefined;
  SprinklersSec3Screen7: undefined;
  SprinklersSec3Screen8: undefined;
  SprinklersSec3Screen9: undefined;
  SprinklersSec3Screen10: undefined;
  SprinklersSec3Screen11: undefined;
  SprinklersSec3Screen12: undefined;
  SprinklersSec3Screen13: undefined;
  SprinklersSec3Screen14: undefined;
  SprinklersSec4Screen1: undefined;
  SprinklersSec4Screen2: undefined;
  SprinklersSec4Screen3: undefined;
  SprinklersSec4Screen4: undefined;
  SprinklersSec4Screen5: undefined;
  SprinklersSec4Screen6: undefined;
  SprinklersSec4Screen7: undefined;
  SprinklersSec4Screen8: undefined;
  SprinklersSec4Screen9: undefined;
  SprinklersSec5Screen1: undefined;
  SprinklersSec5Screen2: undefined;
  SprinklersSec5Screen3: undefined;
  SprinklersSec5Screen4: undefined;
  SprinklersSec5Screen5: undefined;
  SprinklersSec5Screen6: undefined;
  SprinklersSec5Screen7: undefined;
  SandbagsSec1Screen1: undefined;
  SandbagsSec1Screen2: undefined;
  SandbagsSec1Screen3: undefined;
  SandbagsSec2Screen1: undefined;
  SandbagsSec2Screen2: undefined;
  SandbagsSec2Screen3: undefined;
  SandbagsSec2Screen4: undefined;
  SandbagsSec2Screen5: undefined;
  SandbagsSec2Screen6: undefined;
  SandbagsSec2Screen7: undefined;
  SandbagsSec2Screen8: undefined;
  SandbagsSec2Screen9: undefined;
  SandbagsSec2Screen10: undefined;
  EmotionalSandbagsSec3Screen1: undefined;
  EmotionalSandbagsSec3Screen2: undefined;
  EmotionalSandbagsSec3Screen3: undefined;
  EmotionalSandbagsSec3Screen4: undefined;
  EmotionalSandbagsSec3Screen5: undefined;
  EmotionalSandbagsSec3Screen6: undefined;
  EmotionalSandbagsSec3Screen7: undefined;
  EmotionalSandbagsSec3Screen8: undefined;
  EmotionalSandbagsSec3Screen9: undefined;
  EmotionalSandbagsSec3Screen10: undefined;
  EmotionalSandbagsSec4Screen1: undefined;
  EmotionalSandbagsSec4Screen2: undefined;
  EmotionalSandbagsSec4Screen3: undefined;
  EmotionalSandbagsSec4Screen4: undefined;
  EmotionalSandbagsSec4Screen5: undefined;
  EmotionalSandbagsSec4Screen6: undefined;
  EmotionalSandbagsSec4Screen7: undefined;
  EmotionalSandbagsSec4Screen8: undefined;
  EmotionalSandbagsSec5Screen1: undefined;
  EmotionalSandbagsSec5Screen2: undefined;
  EmotionalSandbagsSec5Screen3: undefined;
  EmotionalSandbagsSec5Screen4: undefined;
  EmotionalSandbagsSec5Screen5: undefined;
  EmotionalSandbagsSec5Screen6: undefined;
  EmotionalSandbagsSec5Screen7: undefined;
  EmotionalSandbagsSec5Screen8: undefined;
  EmotionalSandbagsSec5Screen9: undefined;
  EmotionalSandbagsSec5Screen10: undefined;
  EmotionalSandbagsSec6Screen1: undefined;
  EmotionalSandbagsSec6Screen2: undefined;
  EmotionalSandbagsSec6Screen3: undefined;
  EmotionalSandbagsSec6Screen4: undefined;
  EmotionalSandbagsSec6Screen5: undefined;
  EmotionalSandbagsSec6Screen6: undefined;
  CommunicationMistakesSec1Screen1: undefined;
  CommunicationMistakesSec1Screen2: undefined;
  CommunicationMistakesSec1Screen3: undefined;
  CommunicationMistakesSec1Screen4: undefined;
  CommunicationMistakesSec1Screen5: undefined;
  CommunicationMistakesSec1Screen6: undefined;
  CommunicationMistakesSec2Screen1: undefined;
  CommunicationMistakesSec2Screen2: undefined;
  CommunicationMistakesSec2Screen3: undefined;
  CommunicationMistakesSec2Screen4: undefined;
  CommunicationMistakesSec2Screen5: undefined;
  CommunicationMistakesSec2Screen6: undefined;
  CommunicationMistakesSec2Screen7: undefined;
  CommunicationMistakesSec2Screen8: undefined;
  CommunicationMistakesSec2Screen9: undefined;
  CommunicationMistakesSec3Screen1: undefined;
  CommunicationMistakesSec3Screen2: undefined;
  CommunicationMistakesSec3Screen3: undefined;
  CommunicationMistakesSec3Screen4: undefined;
  CommunicationMistakesSec3Screen5: undefined;
  CommunicationMistakesSec3Screen6: undefined;
  CommunicationMistakesSec4Screen1: undefined;
  CommunicationMistakesSec4Screen2: undefined;
  CommunicationMistakesSec4Screen3: undefined;
  CommunicationMistakesSec4Screen4: undefined;
  CommunicationMistakesSec5Screen1: undefined;
  CommunicationMistakesSec5Screen2: undefined;
  CommunicationMistakesSec5Screen3: undefined;
  CommunicationMistakesSec5Screen4: undefined;
  CommunicationMistakesSec5Screen5: undefined;
  CommunicationMistakesSec5Screen6: undefined;
  CommunicationMistakesSec5Screen7: undefined;
  CommunicationMistakesSec6Screen1: undefined;
  CommunicationMistakesSec6Screen2: undefined;
  CommunicationMistakesSec6Screen3: undefined;
  CommunicationMistakesSec7Screen1: undefined;
  CommunicationMistakesSec7Screen2: undefined;
  CommunicationMistakesSec8Screen1: undefined;
  CommunicationMistakesSec8Screen2: undefined;
  CommunicationMistakesSec8Screen3: undefined;
  CommunicationMistakesSec9Screen1: undefined;
  CommunicationMistakesSec10Screen1: undefined;
  CommunicationMistakesSec10Screen2: undefined;
  CommunicationMistakesSec10Screen3: undefined;
  CommunicationMistakesSec11Screen1: undefined;
  CommunicationMistakesSec11Screen2: undefined;
  CommunicationMistakesSec11Screen3: undefined;
  CommunicationMistakesSec11Screen4: undefined;
  CommunicationMistakesSec12Screen1: undefined;
  CommunicationMistakesSec12Screen2: undefined;
  CommunicationMistakesSec12Screen3: undefined;
  CommunicationMistakesSec12Screen4: undefined;
  CommunicationMistakesSec12Screen5: undefined;
  CommunicationMistakesSec12Screen6: undefined;
  CommunicationMistakesSec13Screen1: undefined;
  CommunicationMistakesSec13Screen2: undefined;
  CommunicationMistakesSec13Screen3: undefined;
  CommunicationMistakesSec13Screen4: undefined;
  CommunicationMistakesSec13Screen5: undefined;
  HelpingProcessEmotionsSec1Screen1: undefined;
  HelpingProcessEmotionsSec2Screen1: undefined;
  HelpingProcessEmotionsSec2Screen2: undefined;
  HelpingProcessEmotionsSec2Screen3: undefined;
  HelpingProcessEmotionsSec2Screen4: undefined;
  HelpingProcessEmotionsSec2Screen5: undefined;
  HelpingProcessEmotionsSec2Screen6: undefined;
  HelpingProcessEmotionsSec2Screen7: undefined;
  HelpingProcessEmotionsSec2Screen8: undefined;
  HelpingProcessEmotionsSec2Screen9: undefined;
  HelpingProcessEmotionsSec2Screen10: undefined;
  ServeReturnLesson: undefined;
  ServeReturnSec1Screen1: undefined;
  ServeReturnSec1Screen2: undefined;
  ServeReturnSec1Screen3: undefined;
  ServeReturnSec1Screen4: undefined;
  ServeReturnSec2Screen1: undefined;
  ServeReturnSec2Screen2: undefined;
  ServeReturnSec2Screen3: undefined;
  ServeReturnSec2Screen4: undefined;
  ServeReturnSec3Screen1: undefined;
  ServeReturnSec3Screen2: undefined;
  ServeReturnSec3Screen3: undefined;
  ServeReturnSec3Screen4: undefined;
  ServeReturnSec3Screen5: undefined;
  ServeReturnSec4Screen1: undefined;
  ServeReturnSec4Screen2: undefined;
  ServeReturnSec4Screen3: undefined;
  ServeReturnSec5Screen1: undefined;
  ServeReturnSec5Screen2: undefined;
  ServeReturnSec5Screen3: undefined;
  ServeReturnSec6Screen1: undefined;
  ServeReturnSec6Screen2: undefined;
  ServeReturnSec6Screen3: undefined;
  RecordingDeepBondMomentsSec1Screen1: undefined;
  RecordingDeepBondMomentsSec1Screen2: undefined;
  RecordingDeepBondMomentsSec1Screen3: undefined;
  RecordingDeepBondMomentsSec1Screen4: undefined;
  RecordingDeepBondMomentsSec1Screen5: undefined;
  RecordingDeepBondMomentsSec1Screen6: undefined;
  DissociationSec1Screen1: undefined;
  DissociationSec1Screen2: undefined;
  DissociationSec1Screen3: undefined;
  DissociationSec1Screen4: undefined;
  DissociationSec1Screen5: undefined;
  DissociationSec1Screen6: undefined;
  DissociationSec1Screen7: undefined;
  DissociationSec2Screen1: undefined;
  DissociationSec2Screen2: undefined;
  DissociationSec2Screen3: undefined;
  DissociationSec2Screen4: undefined;
  DissociationSec2Screen5: undefined;
  DissociationSec2Screen6: undefined;
  DissociationSec3Screen1: undefined;
  DissociationSec3Screen2: undefined;
  DissociationSec3Screen3: undefined;
  DissociationSec3Screen4: undefined;
  DissociationSec3Screen5: undefined;
  DissociationSec3Screen6: undefined;
  DissociationSec3Screen7: undefined;
  DissociationSec3Screen8: undefined;
  DissociationSec3Screen9: undefined;
  DissociationSec4Screen1: undefined;
  DissociationSec4Screen2: undefined;
  DissociationSec4Screen3: undefined;
};

const Stack = createNativeStackNavigator<LessonStackParamList>();

export const LessonNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Lesson1Screen1" component={Lesson1Screen1} />
      <Stack.Screen name="Lesson1Screen2" component={Lesson1Screen2} />
      <Stack.Screen name="Lesson1Screen3" component={Lesson1Screen3} />
      <Stack.Screen name="Lesson1Screen4" component={Lesson1Screen4} />
      <Stack.Screen name="Lesson1Screen5" component={Lesson1Screen5} />
      <Stack.Screen name="Lesson1Screen6" component={Lesson1Screen6} />
      <Stack.Screen name="Lesson1Screen7" component={Lesson1Screen7} />
      <Stack.Screen name="Lesson1Screen8" component={Lesson1Screen8} />
      <Stack.Screen name="Lesson1Screen9" component={Lesson1Screen9} />
      <Stack.Screen name="Lesson1Screen10" component={Lesson1Screen10} />
      <Stack.Screen name="Lesson1Screen11" component={Lesson1Screen11} />
      <Stack.Screen name="Lesson1Quiz" component={Lesson1Quiz} />
      <Stack.Screen name="Lesson1QuizQ1" component={Lesson1QuizQ1} />
      <Stack.Screen name="Lesson1QuizQ2" component={Lesson1QuizQ2} />
      <Stack.Screen name="Lesson1QuizQ3" component={Lesson1QuizQ3} />
      <Stack.Screen name="Lesson1Complete" component={Lesson1Complete} />
      <Stack.Screen name="Lesson2Screen1" component={Lesson2Screen1} />
      <Stack.Screen name="Lesson2Screen2" component={Lesson2Screen2} />
      <Stack.Screen name="Lesson2Screen3" component={Lesson2Screen3} />
      <Stack.Screen name="Lesson2Screen4" component={Lesson2Screen4} />
      <Stack.Screen name="Lesson2Screen5" component={Lesson2Screen5} />
      <Stack.Screen name="Lesson2Screen6" component={Lesson2Screen6} />
      <Stack.Screen name="Lesson2Screen7" component={Lesson2Screen7} />
      <Stack.Screen name="Lesson2Screen8" component={Lesson2Screen8} />
      <Stack.Screen name="Lesson2Screen9" component={Lesson2Screen9} />
      <Stack.Screen name="Lesson2Screen10" component={Lesson2Screen10} />
      <Stack.Screen name="Lesson2Screen11" component={Lesson2Screen11} />
      <Stack.Screen name="Lesson2Screen12" component={Lesson2Screen12} />
      <Stack.Screen name="Lesson2Quiz" component={Lesson2Quiz} />
      <Stack.Screen name="Lesson2QuizQ1" component={Lesson2QuizQ1} />
      <Stack.Screen name="Lesson2QuizQ2" component={Lesson2QuizQ2} />
      <Stack.Screen name="Lesson2QuizQ3" component={Lesson2QuizQ3} />
      <Stack.Screen name="Lesson2Complete" component={Lesson2Complete} />
      <Stack.Screen name="Lesson3Screen1" component={Lesson3Screen1} />
      <Stack.Screen name="Lesson3Screen2" component={Lesson3Screen2} />
      <Stack.Screen name="Lesson3Screen3" component={Lesson3Screen3} />
      <Stack.Screen name="Lesson3Screen4" component={Lesson3Screen4} />
      <Stack.Screen name="Lesson3Screen5" component={Lesson3Screen5} />
      <Stack.Screen name="Lesson3Screen6" component={Lesson3Screen6} />
      <Stack.Screen name="Lesson3Screen7" component={Lesson3Screen7} />
      <Stack.Screen name="Lesson3Screen8" component={Lesson3Screen8} />
      <Stack.Screen name="Lesson3Screen9" component={Lesson3Screen9} />
      <Stack.Screen name="Lesson3Screen10" component={Lesson3Screen10} />
      <Stack.Screen name="Lesson3Screen11" component={Lesson3Screen11} />
      <Stack.Screen name="Lesson3Screen12" component={Lesson3Screen12} />
      <Stack.Screen name="Lesson3Quiz" component={Lesson3Quiz} />
      <Stack.Screen name="Lesson3QuizQ1" component={Lesson3QuizQ1} />
      <Stack.Screen name="Lesson3QuizQ2" component={Lesson3QuizQ2} />
      <Stack.Screen name="Lesson3QuizQ3" component={Lesson3QuizQ3} />
      <Stack.Screen name="Lesson3QuizQ4" component={Lesson3QuizQ4} />
      <Stack.Screen name="Lesson3QuizQ5" component={Lesson3QuizQ5} />
      <Stack.Screen name="Lesson3QuizQ6" component={Lesson3QuizQ6} />
      <Stack.Screen name="Lesson3Complete" component={Lesson3Complete} />
      <Stack.Screen name="Lesson4Screen1" component={Lesson4Screen1} />
      <Stack.Screen name="Lesson4Screen2" component={Lesson4Screen2} />
      <Stack.Screen name="Lesson4Screen3" component={Lesson4Screen3} />
      <Stack.Screen name="Lesson4Screen4" component={Lesson4Screen4} />
      <Stack.Screen name="Lesson4Screen5" component={Lesson4Screen5} />
      <Stack.Screen name="Lesson4Screen6" component={Lesson4Screen6} />
      <Stack.Screen name="Lesson4Screen7" component={Lesson4Screen7} />
      <Stack.Screen name="Lesson4Screen8" component={Lesson4Screen8} />
      <Stack.Screen name="Lesson4Screen9" component={Lesson4Screen9} />
      <Stack.Screen name="Lesson4Screen10" component={Lesson4Screen10} />
      <Stack.Screen name="Lesson4Screen11" component={Lesson4Screen11} />
      <Stack.Screen name="Lesson4Quiz" component={Lesson4Quiz} />
      <Stack.Screen name="Lesson4QuizQ1" component={Lesson4QuizQ1} />
      <Stack.Screen name="Lesson4QuizQ2" component={Lesson4QuizQ2} />
      <Stack.Screen name="Lesson4QuizQ3" component={Lesson4QuizQ3} />
      <Stack.Screen name="Lesson4QuizQ4" component={Lesson4QuizQ4} />
      <Stack.Screen name="Lesson4QuizQ5" component={Lesson4QuizQ5} />
      <Stack.Screen name="Lesson4QuizQ6" component={Lesson4QuizQ6} />
      <Stack.Screen name="Lesson4Complete" component={Lesson4Complete} />
      <Stack.Screen name="Lesson5Sec1Screen1" component={Lesson5Sec1Screen1} />
      <Stack.Screen name="Lesson5Sec1Screen2" component={Lesson5Sec1Screen2} />
      <Stack.Screen name="Lesson5Sec1Screen3" component={Lesson5Sec1Screen3} />
      <Stack.Screen name="Lesson5Sec1Screen4" component={Lesson5Sec1Screen4} />
      <Stack.Screen name="Lesson5Sec1Screen5" component={Lesson5Sec1Screen5} />
      <Stack.Screen name="Lesson5Sec1Screen6" component={Lesson5Sec1Screen6} />
      <Stack.Screen name="Lesson5Sec1Screen7" component={Lesson5Sec1Screen7} />
      <Stack.Screen name="Lesson5Sec2Screen1" component={Lesson5Sec2Screen1} />
      <Stack.Screen name="Lesson5Sec2Screen2" component={Lesson5Sec2Screen2} />
      <Stack.Screen name="Lesson5Sec2Screen3" component={Lesson5Sec2Screen3} />
      <Stack.Screen name="Lesson5Sec2Screen4" component={Lesson5Sec2Screen4} />
      <Stack.Screen name="Lesson5Sec3Screen1" component={Lesson5Sec3Screen1} />
      <Stack.Screen name="Lesson5Sec3Screen2" component={Lesson5Sec3Screen2} />
      <Stack.Screen name="Lesson5Sec3Screen3" component={Lesson5Sec3Screen3} />
      <Stack.Screen name="Lesson5Sec3Screen4" component={Lesson5Sec3Screen4} />
      <Stack.Screen name="Lesson5Sec3Screen5" component={Lesson5Sec3Screen5} />
      <Stack.Screen name="Lesson5Sec3Screen6" component={Lesson5Sec3Screen6} />
      <Stack.Screen name="Lesson5Sec3Screen7" component={Lesson5Sec3Screen7} />
      <Stack.Screen name="Lesson5Sec3Screen8" component={Lesson5Sec3Screen8} />
      <Stack.Screen name="Lesson5Sec4Screen1" component={Lesson5Sec4Screen1} />
      <Stack.Screen name="Lesson5Sec4Screen2" component={Lesson5Sec4Screen2} />
      <Stack.Screen name="Lesson5Sec4Screen3" component={Lesson5Sec4Screen3} />
      <Stack.Screen name="Lesson5Sec4Screen4" component={Lesson5Sec4Screen4} />
      <Stack.Screen name="Lesson5Complete" component={Lesson5Complete} />
      <Stack.Screen name="NamingEmotionsSub1Screen1" component={NamingEmotionsSub1Screen1} />
      <Stack.Screen name="NamingEmotionsSub1Screen2" component={NamingEmotionsSub1Screen2} />
      <Stack.Screen name="NamingEmotionsSub1Screen3" component={NamingEmotionsSub1Screen3} />
      <Stack.Screen name="NamingEmotionsSub1Screen4" component={NamingEmotionsSub1Screen4} />
      <Stack.Screen name="NamingEmotionsSub1Screen5" component={NamingEmotionsSub1Screen5} />
      <Stack.Screen name="NamingEmotionsSub1Screen6" component={NamingEmotionsSub1Screen6} />
      <Stack.Screen name="NamingEmotionsSub2Screen1" component={NamingEmotionsSub2Screen1} />
      <Stack.Screen name="NamingEmotionsSub2Screen2" component={NamingEmotionsSub2Screen2} />
      <Stack.Screen name="NamingEmotionsSub2Screen3" component={NamingEmotionsSub2Screen3} />
      <Stack.Screen name="NamingEmotionsSub2Screen4" component={NamingEmotionsSub2Screen4} />
      <Stack.Screen name="NamingEmotionsSub2Screen5" component={NamingEmotionsSub2Screen5} />
      <Stack.Screen name="NamingEmotionsSub2Screen6" component={NamingEmotionsSub2Screen6} />
      <Stack.Screen name="NamingEmotionsSub3Screen1" component={NamingEmotionsSub3Screen1} />
      <Stack.Screen name="NamingEmotionsSub3Screen2" component={NamingEmotionsSub3Screen2} />
      <Stack.Screen name="NamingEmotionsSub3Screen3" component={NamingEmotionsSub3Screen3} />
      <Stack.Screen name="NamingEmotionsSub3Screen4" component={NamingEmotionsSub3Screen4} />
      <Stack.Screen name="NamingEmotionsSub3Screen5" component={NamingEmotionsSub3Screen5} />
      <Stack.Screen name="NamingEmotionsSub3Screen6" component={NamingEmotionsSub3Screen6} />
      <Stack.Screen name="NamingEmotionsSub4Screen1" component={NamingEmotionsSub4Screen1} />
      <Stack.Screen name="NamingEmotionsSub4Screen2" component={NamingEmotionsSub4Screen2} />
      <Stack.Screen name="NamingEmotionsSub4Screen3" component={NamingEmotionsSub4Screen3} />
      <Stack.Screen name="NamingEmotionsSub4Screen4" component={NamingEmotionsSub4Screen4} />
      <Stack.Screen name="NamingEmotionsSub4Screen5" component={NamingEmotionsSub4Screen5} />
      <Stack.Screen name="NamingEmotionsSub4Screen6" component={NamingEmotionsSub4Screen6} />
      <Stack.Screen name="SprinklersSec1Screen1" component={SprinklersSec1Screen1} />
      <Stack.Screen name="SprinklersSec1Screen2" component={SprinklersSec1Screen2} />
      <Stack.Screen name="SprinklersSec1Screen3" component={SprinklersSec1Screen3} />
      <Stack.Screen name="SprinklersSec1Screen4" component={SprinklersSec1Screen4} />
      <Stack.Screen name="SprinklersSec1Screen5" component={SprinklersSec1Screen5} />
      <Stack.Screen name="SprinklersSec1Screen6" component={SprinklersSec1Screen6} />
      <Stack.Screen name="SprinklersSec1Screen7" component={SprinklersSec1Screen7} />
      <Stack.Screen name="SprinklersSec1Screen8" component={SprinklersSec1Screen8} />
      <Stack.Screen name="SprinklersSec1Screen9" component={SprinklersSec1Screen9} />
      <Stack.Screen name="SprinklersSec1Screen10" component={SprinklersSec1Screen10} />
      <Stack.Screen name="SprinklersSec2Screen1" component={SprinklersSec2Screen1} />
      <Stack.Screen name="SprinklersSec2Screen2" component={SprinklersSec2Screen2} />
      <Stack.Screen name="SprinklersSec2Screen3" component={SprinklersSec2Screen3} />
      <Stack.Screen name="SprinklersSec2Screen4" component={SprinklersSec2Screen4} />
      <Stack.Screen name="SprinklersSec2Screen5" component={SprinklersSec2Screen5} />
      <Stack.Screen name="SprinklersSec2Screen6" component={SprinklersSec2Screen6} />
      <Stack.Screen name="SprinklersSec2Screen7" component={SprinklersSec2Screen7} />
      <Stack.Screen name="SprinklersSec2Screen8" component={SprinklersSec2Screen8} />
      <Stack.Screen name="SprinklersSec2Screen9" component={SprinklersSec2Screen9} />
      <Stack.Screen name="SprinklersSec2Screen10" component={SprinklersSec2Screen10} />
      <Stack.Screen name="SprinklersSec2Screen11" component={SprinklersSec2Screen11} />
      <Stack.Screen name="SprinklersSec2Screen12" component={SprinklersSec2Screen12} />
      <Stack.Screen name="SprinklersSec2Screen13" component={SprinklersSec2Screen13} />
      <Stack.Screen name="SprinklersSec3Screen1" component={SprinklersSec3Screen1} />
      <Stack.Screen name="SprinklersSec3Screen2" component={SprinklersSec3Screen2} />
      <Stack.Screen name="SprinklersSec3Screen3" component={SprinklersSec3Screen3} />
      <Stack.Screen name="SprinklersSec3Screen4" component={SprinklersSec3Screen4} />
      <Stack.Screen name="SprinklersSec3Screen5" component={SprinklersSec3Screen5} />
      <Stack.Screen name="SprinklersSec3Screen6" component={SprinklersSec3Screen6} />
      <Stack.Screen name="SprinklersSec3Screen7" component={SprinklersSec3Screen7} />
      <Stack.Screen name="SprinklersSec3Screen8" component={SprinklersSec3Screen8} />
      <Stack.Screen name="SprinklersSec3Screen9" component={SprinklersSec3Screen9} />
      <Stack.Screen name="SprinklersSec3Screen10" component={SprinklersSec3Screen10} />
      <Stack.Screen name="SprinklersSec3Screen11" component={SprinklersSec3Screen11} />
      <Stack.Screen name="SprinklersSec3Screen12" component={SprinklersSec3Screen12} />
      <Stack.Screen name="SprinklersSec3Screen13" component={SprinklersSec3Screen13} />
      <Stack.Screen name="SprinklersSec3Screen14" component={SprinklersSec3Screen14} />
      <Stack.Screen name="SprinklersSec4Screen1" component={SprinklersSec4Screen1} />
      <Stack.Screen name="SprinklersSec4Screen2" component={SprinklersSec4Screen2} />
      <Stack.Screen name="SprinklersSec4Screen3" component={SprinklersSec4Screen3} />
      <Stack.Screen name="SprinklersSec4Screen4" component={SprinklersSec4Screen4} />
      <Stack.Screen name="SprinklersSec4Screen5" component={SprinklersSec4Screen5} />
      <Stack.Screen name="SprinklersSec4Screen6" component={SprinklersSec4Screen6} />
      <Stack.Screen name="SprinklersSec4Screen7" component={SprinklersSec4Screen7} />
      <Stack.Screen name="SprinklersSec4Screen8" component={SprinklersSec4Screen8} />
      <Stack.Screen name="SprinklersSec4Screen9" component={SprinklersSec4Screen9} />
      <Stack.Screen name="SprinklersSec5Screen1" component={SprinklersSec5Screen1} />
      <Stack.Screen name="SprinklersSec5Screen2" component={SprinklersSec5Screen2} />
      <Stack.Screen name="SprinklersSec5Screen3" component={SprinklersSec5Screen3} />
      <Stack.Screen name="SprinklersSec5Screen4" component={SprinklersSec5Screen4} />
      <Stack.Screen name="SprinklersSec5Screen5" component={SprinklersSec5Screen5} />
      <Stack.Screen name="SprinklersSec5Screen6" component={SprinklersSec5Screen6} />
      <Stack.Screen name="SprinklersSec5Screen7" component={SprinklersSec5Screen7} />
      <Stack.Screen name="SandbagsSec1Screen1" component={SandbagsSec1Screen1} />
      <Stack.Screen name="SandbagsSec1Screen2" component={SandbagsSec1Screen2} />
      <Stack.Screen name="SandbagsSec1Screen3" component={SandbagsSec1Screen3} />
      <Stack.Screen name="SandbagsSec2Screen1" component={SandbagsSec2Screen1} />
      <Stack.Screen name="SandbagsSec2Screen2" component={SandbagsSec2Screen2} />
      <Stack.Screen name="SandbagsSec2Screen3" component={SandbagsSec2Screen3} />
      <Stack.Screen name="SandbagsSec2Screen4" component={SandbagsSec2Screen4} />
      <Stack.Screen name="SandbagsSec2Screen5" component={SandbagsSec2Screen5} />
      <Stack.Screen name="SandbagsSec2Screen6" component={SandbagsSec2Screen6} />
      <Stack.Screen name="SandbagsSec2Screen7" component={SandbagsSec2Screen7} />
      <Stack.Screen name="SandbagsSec2Screen8" component={SandbagsSec2Screen8} />
      <Stack.Screen name="SandbagsSec2Screen9" component={SandbagsSec2Screen9} />
      <Stack.Screen name="SandbagsSec2Screen10" component={SandbagsSec2Screen10} />
      <Stack.Screen name="EmotionalSandbagsSec3Screen1" component={EmotionalSandbagsSec3Screen1} />
      <Stack.Screen name="EmotionalSandbagsSec3Screen2" component={EmotionalSandbagsSec3Screen2} />
      <Stack.Screen name="EmotionalSandbagsSec3Screen3" component={EmotionalSandbagsSec3Screen3} />
      <Stack.Screen name="EmotionalSandbagsSec3Screen4" component={EmotionalSandbagsSec3Screen4} />
      <Stack.Screen name="EmotionalSandbagsSec3Screen5" component={EmotionalSandbagsSec3Screen5} />
      <Stack.Screen name="EmotionalSandbagsSec3Screen6" component={EmotionalSandbagsSec3Screen6} />
      <Stack.Screen name="EmotionalSandbagsSec3Screen7" component={EmotionalSandbagsSec3Screen7} />
      <Stack.Screen name="EmotionalSandbagsSec3Screen8" component={EmotionalSandbagsSec3Screen8} />
      <Stack.Screen name="EmotionalSandbagsSec3Screen9" component={EmotionalSandbagsSec3Screen9} />
      <Stack.Screen name="EmotionalSandbagsSec3Screen10" component={EmotionalSandbagsSec3Screen10} />
      <Stack.Screen name="EmotionalSandbagsSec4Screen1" component={EmotionalSandbagsSec4Screen1} />
      <Stack.Screen name="EmotionalSandbagsSec4Screen2" component={EmotionalSandbagsSec4Screen2} />
      <Stack.Screen name="EmotionalSandbagsSec4Screen3" component={EmotionalSandbagsSec4Screen3} />
      <Stack.Screen name="EmotionalSandbagsSec4Screen4" component={EmotionalSandbagsSec4Screen4} />
      <Stack.Screen name="EmotionalSandbagsSec4Screen5" component={EmotionalSandbagsSec4Screen5} />
      <Stack.Screen name="EmotionalSandbagsSec4Screen6" component={EmotionalSandbagsSec4Screen6} />
      <Stack.Screen name="EmotionalSandbagsSec4Screen7" component={EmotionalSandbagsSec4Screen7} />
      <Stack.Screen name="EmotionalSandbagsSec4Screen8" component={EmotionalSandbagsSec4Screen8} />
      <Stack.Screen name="EmotionalSandbagsSec5Screen1" component={EmotionalSandbagsSec5Screen1} />
      <Stack.Screen name="EmotionalSandbagsSec5Screen2" component={EmotionalSandbagsSec5Screen2} />
      <Stack.Screen name="EmotionalSandbagsSec5Screen3" component={EmotionalSandbagsSec5Screen3} />
      <Stack.Screen name="EmotionalSandbagsSec5Screen4" component={EmotionalSandbagsSec5Screen4} />
      <Stack.Screen name="EmotionalSandbagsSec5Screen5" component={EmotionalSandbagsSec5Screen5} />
      <Stack.Screen name="EmotionalSandbagsSec5Screen6" component={EmotionalSandbagsSec5Screen6} />
      <Stack.Screen name="EmotionalSandbagsSec5Screen7" component={EmotionalSandbagsSec5Screen7} />
      <Stack.Screen name="EmotionalSandbagsSec5Screen8" component={EmotionalSandbagsSec5Screen8} />
      <Stack.Screen name="EmotionalSandbagsSec5Screen9" component={EmotionalSandbagsSec5Screen9} />
      <Stack.Screen name="EmotionalSandbagsSec5Screen10" component={EmotionalSandbagsSec5Screen10} />
      <Stack.Screen name="EmotionalSandbagsSec6Screen1" component={EmotionalSandbagsSec6Screen1} />
      <Stack.Screen name="EmotionalSandbagsSec6Screen2" component={EmotionalSandbagsSec6Screen2} />
      <Stack.Screen name="EmotionalSandbagsSec6Screen3" component={EmotionalSandbagsSec6Screen3} />
      <Stack.Screen name="EmotionalSandbagsSec6Screen4" component={EmotionalSandbagsSec6Screen4} />
      <Stack.Screen name="EmotionalSandbagsSec6Screen5" component={EmotionalSandbagsSec6Screen5} />
      <Stack.Screen name="EmotionalSandbagsSec6Screen6" component={EmotionalSandbagsSec6Screen6} />
      <Stack.Screen name="CommunicationMistakesSec1Screen1" component={CommunicationMistakesSec1Screen1} />
      <Stack.Screen name="CommunicationMistakesSec1Screen2" component={CommunicationMistakesSec1Screen2} />
      <Stack.Screen name="CommunicationMistakesSec1Screen3" component={CommunicationMistakesSec1Screen3} />
      <Stack.Screen name="CommunicationMistakesSec1Screen4" component={CommunicationMistakesSec1Screen4} />
      <Stack.Screen name="CommunicationMistakesSec1Screen5" component={CommunicationMistakesSec1Screen5} />
      <Stack.Screen name="CommunicationMistakesSec1Screen6" component={CommunicationMistakesSec1Screen6} />
      <Stack.Screen name="CommunicationMistakesSec2Screen1" component={CommunicationMistakesSec2Screen1} />
      <Stack.Screen name="CommunicationMistakesSec2Screen2" component={CommunicationMistakesSec2Screen2} />
      <Stack.Screen name="CommunicationMistakesSec2Screen3" component={CommunicationMistakesSec2Screen3} />
      <Stack.Screen name="CommunicationMistakesSec2Screen4" component={CommunicationMistakesSec2Screen4} />
      <Stack.Screen name="CommunicationMistakesSec2Screen5" component={CommunicationMistakesSec2Screen5} />
      <Stack.Screen name="CommunicationMistakesSec2Screen6" component={CommunicationMistakesSec2Screen6} />
      <Stack.Screen name="CommunicationMistakesSec2Screen7" component={CommunicationMistakesSec2Screen7} />
      <Stack.Screen name="CommunicationMistakesSec2Screen8" component={CommunicationMistakesSec2Screen8} />
      <Stack.Screen name="CommunicationMistakesSec2Screen9" component={CommunicationMistakesSec2Screen9} />
      <Stack.Screen name="CommunicationMistakesSec3Screen1" component={CommunicationMistakesSec3Screen1} />
      <Stack.Screen name="CommunicationMistakesSec3Screen2" component={CommunicationMistakesSec3Screen2} />
      <Stack.Screen name="CommunicationMistakesSec3Screen3" component={CommunicationMistakesSec3Screen3} />
      <Stack.Screen name="CommunicationMistakesSec3Screen4" component={CommunicationMistakesSec3Screen4} />
      <Stack.Screen name="CommunicationMistakesSec3Screen5" component={CommunicationMistakesSec3Screen5} />
      <Stack.Screen name="CommunicationMistakesSec3Screen6" component={CommunicationMistakesSec3Screen6} />
      <Stack.Screen name="CommunicationMistakesSec4Screen1" component={CommunicationMistakesSec4Screen1} />
      <Stack.Screen name="CommunicationMistakesSec4Screen2" component={CommunicationMistakesSec4Screen2} />
      <Stack.Screen name="CommunicationMistakesSec4Screen3" component={CommunicationMistakesSec4Screen3} />
      <Stack.Screen name="CommunicationMistakesSec4Screen4" component={CommunicationMistakesSec4Screen4} />
      <Stack.Screen name="CommunicationMistakesSec5Screen1" component={CommunicationMistakesSec5Screen1} />
      <Stack.Screen name="CommunicationMistakesSec5Screen2" component={CommunicationMistakesSec5Screen2} />
      <Stack.Screen name="CommunicationMistakesSec5Screen3" component={CommunicationMistakesSec5Screen3} />
      <Stack.Screen name="CommunicationMistakesSec5Screen4" component={CommunicationMistakesSec5Screen4} />
      <Stack.Screen name="CommunicationMistakesSec5Screen5" component={CommunicationMistakesSec5Screen5} />
      <Stack.Screen name="CommunicationMistakesSec5Screen6" component={CommunicationMistakesSec5Screen6} />
      <Stack.Screen name="CommunicationMistakesSec5Screen7" component={CommunicationMistakesSec5Screen7} />
      <Stack.Screen name="CommunicationMistakesSec6Screen1" component={CommunicationMistakesSec6Screen1} />
      <Stack.Screen name="CommunicationMistakesSec6Screen2" component={CommunicationMistakesSec6Screen2} />
      <Stack.Screen name="CommunicationMistakesSec6Screen3" component={CommunicationMistakesSec6Screen3} />
      <Stack.Screen name="CommunicationMistakesSec7Screen1" component={CommunicationMistakesSec7Screen1} />
      <Stack.Screen name="CommunicationMistakesSec7Screen2" component={CommunicationMistakesSec7Screen2} />
      <Stack.Screen name="CommunicationMistakesSec8Screen1" component={CommunicationMistakesSec8Screen1} />
      <Stack.Screen name="CommunicationMistakesSec8Screen2" component={CommunicationMistakesSec8Screen2} />
      <Stack.Screen name="CommunicationMistakesSec8Screen3" component={CommunicationMistakesSec8Screen3} />
      <Stack.Screen name="CommunicationMistakesSec9Screen1" component={CommunicationMistakesSec9Screen1} />
      <Stack.Screen name="CommunicationMistakesSec10Screen1" component={CommunicationMistakesSec10Screen1} />
      <Stack.Screen name="CommunicationMistakesSec10Screen2" component={CommunicationMistakesSec10Screen2} />
      <Stack.Screen name="CommunicationMistakesSec10Screen3" component={CommunicationMistakesSec10Screen3} />
      <Stack.Screen name="CommunicationMistakesSec11Screen1" component={CommunicationMistakesSec11Screen1} />
      <Stack.Screen name="CommunicationMistakesSec11Screen2" component={CommunicationMistakesSec11Screen2} />
      <Stack.Screen name="CommunicationMistakesSec11Screen3" component={CommunicationMistakesSec11Screen3} />
      <Stack.Screen name="CommunicationMistakesSec11Screen4" component={CommunicationMistakesSec11Screen4} />
      <Stack.Screen name="CommunicationMistakesSec12Screen1" component={CommunicationMistakesSec12Screen1} />
      <Stack.Screen name="CommunicationMistakesSec12Screen2" component={CommunicationMistakesSec12Screen2} />
      <Stack.Screen name="CommunicationMistakesSec12Screen3" component={CommunicationMistakesSec12Screen3} />
      <Stack.Screen name="CommunicationMistakesSec12Screen4" component={CommunicationMistakesSec12Screen4} />
      <Stack.Screen name="CommunicationMistakesSec12Screen5" component={CommunicationMistakesSec12Screen5} />
      <Stack.Screen name="CommunicationMistakesSec12Screen6" component={CommunicationMistakesSec12Screen6} />
      <Stack.Screen name="CommunicationMistakesSec13Screen1" component={CommunicationMistakesSec13Screen1} />
      <Stack.Screen name="CommunicationMistakesSec13Screen2" component={CommunicationMistakesSec13Screen2} />
      <Stack.Screen name="CommunicationMistakesSec13Screen3" component={CommunicationMistakesSec13Screen3} />
      <Stack.Screen name="CommunicationMistakesSec13Screen4" component={CommunicationMistakesSec13Screen4} />
      <Stack.Screen name="CommunicationMistakesSec13Screen5" component={CommunicationMistakesSec13Screen5} />
      <Stack.Screen name="HelpingProcessEmotionsSec1Screen1" component={HelpingProcessEmotionsSec1Screen1} />
      <Stack.Screen name="HelpingProcessEmotionsSec2Screen1" component={HelpingProcessEmotionsSec2Screen1} />
      <Stack.Screen name="HelpingProcessEmotionsSec2Screen2" component={HelpingProcessEmotionsSec2Screen2} />
      <Stack.Screen name="HelpingProcessEmotionsSec2Screen3" component={HelpingProcessEmotionsSec2Screen3} />
      <Stack.Screen name="HelpingProcessEmotionsSec2Screen4" component={HelpingProcessEmotionsSec2Screen4} />
      <Stack.Screen name="HelpingProcessEmotionsSec2Screen5" component={HelpingProcessEmotionsSec2Screen5} />
      <Stack.Screen name="HelpingProcessEmotionsSec2Screen6" component={HelpingProcessEmotionsSec2Screen6} />
      <Stack.Screen name="HelpingProcessEmotionsSec2Screen7" component={HelpingProcessEmotionsSec2Screen7} />
      <Stack.Screen name="HelpingProcessEmotionsSec2Screen8" component={HelpingProcessEmotionsSec2Screen8} />
      <Stack.Screen name="HelpingProcessEmotionsSec2Screen9" component={HelpingProcessEmotionsSec2Screen9} />
      <Stack.Screen name="HelpingProcessEmotionsSec2Screen10" component={HelpingProcessEmotionsSec2Screen10} />
      <Stack.Screen name="ServeReturnLesson" component={ServeReturnLessonScreen} />
      <Stack.Screen name="ServeReturnSec1Screen1" component={ServeReturnSec1Screen1} />
      <Stack.Screen name="ServeReturnSec1Screen2" component={ServeReturnSec1Screen2} />
      <Stack.Screen name="ServeReturnSec1Screen3" component={ServeReturnSec1Screen3} />
      <Stack.Screen name="ServeReturnSec1Screen4" component={ServeReturnSec1Screen4} />
      <Stack.Screen name="ServeReturnSec2Screen1" component={ServeReturnSec2Screen1} />
      <Stack.Screen name="ServeReturnSec2Screen2" component={ServeReturnSec2Screen2} />
      <Stack.Screen name="ServeReturnSec2Screen3" component={ServeReturnSec2Screen3} />
      <Stack.Screen name="ServeReturnSec2Screen4" component={ServeReturnSec2Screen4} />
      <Stack.Screen name="ServeReturnSec3Screen1" component={ServeReturnSec3Screen1} />
      <Stack.Screen name="ServeReturnSec3Screen2" component={ServeReturnSec3Screen2} />
      <Stack.Screen name="ServeReturnSec3Screen3" component={ServeReturnSec3Screen3} />
      <Stack.Screen name="ServeReturnSec3Screen4" component={ServeReturnSec3Screen4} />
      <Stack.Screen name="ServeReturnSec3Screen5" component={ServeReturnSec3Screen5} />
      <Stack.Screen name="ServeReturnSec4Screen1" component={ServeReturnSec4Screen1} />
      <Stack.Screen name="ServeReturnSec4Screen2" component={ServeReturnSec4Screen2} />
      <Stack.Screen name="ServeReturnSec4Screen3" component={ServeReturnSec4Screen3} />
      <Stack.Screen name="ServeReturnSec5Screen1" component={ServeReturnSec5Screen1} />
      <Stack.Screen name="ServeReturnSec5Screen2" component={ServeReturnSec5Screen2} />
      <Stack.Screen name="ServeReturnSec5Screen3" component={ServeReturnSec5Screen3} />
      <Stack.Screen name="ServeReturnSec6Screen1" component={ServeReturnSec6Screen1} />
      <Stack.Screen name="ServeReturnSec6Screen2" component={ServeReturnSec6Screen2} />
      <Stack.Screen name="ServeReturnSec6Screen3" component={ServeReturnSec6Screen3} />
      <Stack.Screen name="RecordingDeepBondMomentsSec1Screen1" component={RecordingDeepBondMomentsSec1Screen1} />
      <Stack.Screen name="RecordingDeepBondMomentsSec1Screen2" component={RecordingDeepBondMomentsSec1Screen2} />
      <Stack.Screen name="RecordingDeepBondMomentsSec1Screen3" component={RecordingDeepBondMomentsSec1Screen3} />
      <Stack.Screen name="RecordingDeepBondMomentsSec1Screen4" component={RecordingDeepBondMomentsSec1Screen4} />
      <Stack.Screen name="RecordingDeepBondMomentsSec1Screen5" component={RecordingDeepBondMomentsSec1Screen5} />
      <Stack.Screen name="RecordingDeepBondMomentsSec1Screen6" component={RecordingDeepBondMomentsSec1Screen6} />
      <Stack.Screen name="DissociationSec1Screen1" component={DissociationSec1Screen1} />
      <Stack.Screen name="DissociationSec1Screen2" component={DissociationSec1Screen2} />
      <Stack.Screen name="DissociationSec1Screen3" component={DissociationSec1Screen3} />
      <Stack.Screen name="DissociationSec1Screen4" component={DissociationSec1Screen4} />
      <Stack.Screen name="DissociationSec1Screen5" component={DissociationSec1Screen5} />
      <Stack.Screen name="DissociationSec1Screen6" component={DissociationSec1Screen6} />
      <Stack.Screen name="DissociationSec1Screen7" component={DissociationSec1Screen7} />
      <Stack.Screen name="DissociationSec2Screen1" component={DissociationSec2Screen1} />
      <Stack.Screen name="DissociationSec2Screen2" component={DissociationSec2Screen2} />
      <Stack.Screen name="DissociationSec2Screen3" component={DissociationSec2Screen3} />
      <Stack.Screen name="DissociationSec2Screen4" component={DissociationSec2Screen4} />
      <Stack.Screen name="DissociationSec2Screen5" component={DissociationSec2Screen5} />
      <Stack.Screen name="DissociationSec2Screen6" component={DissociationSec2Screen6} />
      <Stack.Screen name="DissociationSec3Screen1" component={DissociationSec3Screen1} />
      <Stack.Screen name="DissociationSec3Screen2" component={DissociationSec3Screen2} />
      <Stack.Screen name="DissociationSec3Screen3" component={DissociationSec3Screen3} />
      <Stack.Screen name="DissociationSec3Screen4" component={DissociationSec3Screen4} />
      <Stack.Screen name="DissociationSec3Screen5" component={DissociationSec3Screen5} />
      <Stack.Screen name="DissociationSec3Screen6" component={DissociationSec3Screen6} />
      <Stack.Screen name="DissociationSec3Screen7" component={DissociationSec3Screen7} />
      <Stack.Screen name="DissociationSec3Screen8" component={DissociationSec3Screen8} />
      <Stack.Screen name="DissociationSec3Screen9" component={DissociationSec3Screen9} />
      <Stack.Screen name="DissociationSec4Screen1" component={DissociationSec4Screen1} />
      <Stack.Screen name="DissociationSec4Screen2" component={DissociationSec4Screen2} />
      <Stack.Screen name="DissociationSec4Screen3" component={DissociationSec4Screen3} />
    </Stack.Navigator>
  );
};
