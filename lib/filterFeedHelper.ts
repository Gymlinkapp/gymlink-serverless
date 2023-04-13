import { User } from '@prisma/client';

export const filterFeedHelper = (feed: User[], user: User) => {
  return feed.filter((feedUser) => {
    const userFilterGender = user.filterGender as string[];
    const feedUserGender = feedUser.gender as string;
    const userFilterWorkout = user.filterWorkout as string[];
    const feedUserFilterWorkout = feedUser.filterWorkout as string[];
    const userFilterSkillLevel = user.filterSkillLevel as string[];
    const feedUserFilterSkillLevel = feedUser.filterSkillLevel as string[];
    const userFilterGoals = user.filterGoals as string[];
    const feedUserFilterGoals = feedUser.filterGoals as string[];

    const isUserFilteredGender =
      userFilterGender.length === 0 ||
      userFilterGender.includes(feedUserGender);

    const isUserFilteredGoingToday =
      user.filterGoingToday === false ||
      feedUser.filterGoingToday === user.filterGoingToday;

    const filteredUserWorkout =
      userFilterWorkout.length === 0 ||
      userFilterWorkout.some((workout) =>
        feedUserFilterWorkout.includes(workout)
      );

    const filteredUserSkillLevel =
      userFilterSkillLevel.length === 0 ||
      userFilterSkillLevel.some((skillLevel) =>
        feedUserFilterSkillLevel.includes(skillLevel)
      );

    const filteredUserGoals =
      userFilterGoals.length === 0 ||
      userFilterGoals.some((goal) => feedUserFilterGoals.includes(goal));

    const shouldFilter =
      isUserFilteredGender &&
      isUserFilteredGoingToday &&
      filteredUserWorkout &&
      filteredUserSkillLevel &&
      filteredUserGoals;

    // Return true if all filter conditions are met
    return shouldFilter;
  });
};
