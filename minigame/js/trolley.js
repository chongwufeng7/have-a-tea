'use strict';
const legacy=require('./trolley-legacy');
const {StackedGame,STACK_VERSION,STACK_VERSIONS}=require('./stacked-game');
class Game {
 constructor(level=1,seed=1,tools,version=STACK_VERSION){return STACK_VERSIONS.includes(version)?new StackedGame(level,seed,tools,version):new legacy.Game(level,seed,tools===undefined?1:tools,version);}
 static restore(s){return STACK_VERSIONS.includes(s?.version)?StackedGame.restore(s):legacy.Game.restore(s);}
}
module.exports={...legacy,Game,FLAT_VERSION:legacy.CONFIG_VERSION,CONFIG_VERSION:STACK_VERSION,CONFIG_VERSIONS:[...legacy.CONFIG_VERSIONS,...STACK_VERSIONS],isStacked:g=>STACK_VERSIONS.includes(g.version)};
