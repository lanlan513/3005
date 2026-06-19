import { Story } from '../types/game';

export const STORIES: Story[] = [
  {
    id: 'story-1',
    title: '初见',
    content: '那是一个春日的午后，阳光透过樱花树的枝叶，在草地上撒下斑驳的光影。小女孩第一次在花园里见到了这只蝴蝶——它的翅膀如梦幻般绚烂，在花丛间翩翩起舞。小女孩屏住呼吸，静静地看着它落在自己的指尖。那一刻，仿佛整个世界都安静了下来，只剩下两颗心的初次相遇。',
    fragmentId: 'fragment-1',
    order: 1,
  },
  {
    id: 'story-2',
    title: '约定',
    content: '小女孩给蝴蝶取了一个名字，叫「小忆」。她们在古老的樱花树下许下了一个约定——每年春天，都要在这座花园里相见。蝴蝶轻轻扇动翅膀，仿佛听懂了她的话。阳光透过粉色的花瓣洒落，空气中弥漫着甜蜜的花香。这个约定，深深地刻在了彼此的心里。',
    fragmentId: 'fragment-2',
    order: 2,
  },
  {
    id: 'story-3',
    title: '夏日',
    content: '夏天的花园是她们的秘密基地。午后的阳光温暖而慵懒，小女孩躺在草地上，蝴蝶就停在她的发梢。她们一起看云卷云舒，听蝉鸣阵阵。小女孩会把心里的话悄悄说给蝴蝶听，而蝴蝶则用它轻盈的舞蹈回应。那是一段无忧无虑的时光，充满了阳光和欢笑。',
    fragmentId: 'fragment-3',
    order: 3,
  },
  {
    id: 'story-4',
    title: '离别',
    content: '秋天来得很突然。落叶铺满了花园，花朵开始凋零。小女孩要去很远的地方上学，她抱着蝴蝶哭了很久。蝴蝶静静地停在她的手背上，仿佛在安慰她。在告别的那天，蝴蝶追着火车飞了很远很远，直到再也看不见那熟悉的身影。花园里只剩下秋风，和一个未完成的约定。',
    fragmentId: 'fragment-4',
    order: 4,
  },
  {
    id: 'story-5',
    title: '等待',
    content: '冬天的花园被白雪覆盖，寂静而寒冷。蝴蝶躲在树洞里，做着一个长长的梦。梦里有春天的花香，有小女孩的笑声，有阳光下飞舞的快乐。它相信，只要春天到来，小女孩就会回来。于是，在每一个飘雪的夜晚，蝴蝶都在默默地等待，等待着那个熟悉的身影再次出现在花园里。',
    fragmentId: 'fragment-5',
    order: 5,
  },
  {
    id: 'story-6',
    title: '重逢',
    content: '许多年后，花园又迎来了春天。樱花如期盛开，花瓣随风飘落。一位温柔的女子走进了花园——她就是当年的小女孩。这些年，她从未忘记过这里，忘记过那只蝴蝶。就在这时，一道绚丽的身影从花丛中飞出，落在了她的指尖。泪水滑过脸颊，她们终于重逢了。原来，记忆从未消失，它只是化作了花园里一片片闪光的碎片，等待着被重新拾起。只要心中有爱，等待的尽头，便是永恒的温暖。',
    fragmentId: 'fragment-6',
    order: 6,
  },
];

export const getStoryById = (id: string): Story | undefined => {
  return STORIES.find((s) => s.id === id);
};

export const getStoryByFragmentId = (fragmentId: string): Story | undefined => {
  return STORIES.find((s) => s.fragmentId === fragmentId);
};
