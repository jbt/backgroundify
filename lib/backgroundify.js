var child_process = require('child_process');
var path = require('path');

module.exports = function(){};

var bgArg = process.argv.indexOf('backgroundify');

var bg = module.exports.isBackgroundified = bgArg > -1;

if(module.parent){

  if(bg) return;

  module.exports = function(moduleToLoad, title, numWorkers){

    moduleToLoad = path.resolve(path.dirname(module.parent.filename), moduleToLoad);

    var freeWorkers = [];
    var numWorkers = numWorkers || Math.max(1, require('os').cpus().length - 1);

    var cbs = {};

    function runFinished(msg, freedWorker){

      var cb = cbs[msg.id];
      cb(msg.error || null, msg.data);
      delete cbs[msg.id];

      freeWorkers.push(freedWorker);
      dequeue();
    }

    function dequeue(){
      if(freeWorkers.length && queue.length){
        freeWorkers.shift()._run(queue.shift());
      }else if(workers < numWorkers && queue.length){
        makeWorker()._run(queue.shift());
        workers++;
      }
    }

    function makeWorker(){
      var worker = child_process.fork(__filename, ['backgroundify', moduleToLoad, title]);
      worker._busy = false;
      worker.on('message', function(msg){
        worker._busy = false;
        runFinished(msg, worker);
      });
      worker._run = function(msg){
        worker.send(msg);
      };
      return worker;
    }

    var workers = 0;

    var queue = [];

    return function(){
      var args = [].slice.call(arguments);
      var cb = args.pop();
      var id = Math.random().toString(16).slice(2);
      var msg = { id: id, args: args };
      cbs[id] = cb;

      queue.push(msg);
      dequeue();
    };
  };

  module.exports.isBackgroundified = bg;


}else if(bg){

  // Spawned child
  var moduleToLoad = process.argv[bgArg + 1];
  var title = process.argv[bgArg + 2];

  if(title) process.title = title;

  var m = require(moduleToLoad);

  process.on('message', function(msg){
    try{
      msg.data = m.apply(this, msg.args);
    }catch(e){
      msg.error = e;
    }
    process.send(msg);
  });

}
