export const roles = {
  wolves: [
    {team: 'wolves', name: 'werewolf', canMoveAtNight: true, default: true, doneWihtNightAction: false, }
  ],

  villagers:[
    {team: 'villagers', name: 'villager', canMoveAtNight: false, default: true, doneWihtNightAction: false, },
    {team: 'villagers', name: 'seer', canMoveAtNight: true, default: false, doneWihtNightAction: false,}
  ],

  solos:[
    {team: 'solo', name: 'fool', canMoveAtNight: false, default: false, doneWihtNightAction: false,},
    {team: 'solo', name: 'serial killer', canMoveAtNight: true, default: false, doneWihtNightAction: false, },
  ],
}