/**
 * Singleton class that the scheduling of processes
 */

function CpuScheduler() {};

// Queue containing all ready-to-run processes
CpuScheduler.readyQueue = new Queue();

// The process that is currently being executed
CpuScheduler.currentProcess = null;

// The default quantum value
CpuScheduler.DEFAULT_QUANTUM = 6;

// The timeslice that each process is allocated
CpuScheduler.quantum = CpuScheduler.DEFAULT_QUANTUM;

// The cycle of the executing process
CpuScheduler.cycle = 0;

// The enum that contains all possible scheduling algorithms
CpuScheduler.algorithms = {
    "RR" : "Round Robin",
    "FCFS" : "First Come First Serve",
    "PRIORITY" : "Priority"
};

// The scheduling algorithm currently in use
CpuScheduler.algorithm = "RR";            

// Schedules the next process to be executed
CpuScheduler.schedule = function() {
    // If the process has run out of time or if there is no currently running process, and
    // there is something actually on the queue, switch the current process with the new process.
    if ((CpuScheduler.quantum === CpuScheduler.cycle || !CpuScheduler.currentProcess) 
            && CpuScheduler.readyQueue.getSize()) {
        Kernel.handleInterupts(CONTEXT_SWITCH_IRQ, null);
    }
};

CpuScheduler.setAlgorithm = function(algorithm) {
    algorithm = algorithm.toUpperCase();    
    if (CpuScheduler.algorithms[algorithm]) {
        CpuScheduler.algorithm = algorithm;
        if (CpuScheduler.algorithm === "RR") {
            CpuScheduler.quantum = CpuScheduler.DEFAULT_QUANTUM;
        } else if (CpuScheduler.algorithm === "FCFS") {
            CpuScheduler.quantum = Number.MAX_VALUE;
        } else if (CpuScheduler.algorithm === "PRIORITY") {
            // TODO: Fix
        }
        return true;
    } else {       
        return false;
    }
};

CpuScheduler.getAlgorithm = function() {
    return CpuScheduler.algorithms[CpuScheduler.algorithm];
};

CpuScheduler.getNextProcess = function() {
    if (CpuScheduler.algorithm === "PRIORITY") {
        var priorityProcess = CpuScheduler.readyQueue.dequeue();
        for (var i = 0; i < CpuScheduler.readyQueue.getSize(); i++) {
            var process = CpuScheduler.readyQueue.dequeue();
            if (priorityProcess.priority > process.priority) {
               CpuScheduler.readyQueue.enqueue(priorityProcess);
               priorityProcess = process;
            } else {
               CpuScheduler.readyQueue.enqueue(process);
            }
        }
        return priorityProcess;
    } else {
        return CpuScheduler.readyQueue.dequeue();
    }
};