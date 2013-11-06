/**
 * Singleton class that the scheduling of processes
 */

function CpuScheduler() {};

// Queue containing all ready-to-run processes
CpuScheduler.readyQueue = new Queue();

// The process that is currently being executed
CpuScheduler.currentProcess = null;

// The timeslice that each process is allocated
CpuScheduler.quantum = 6;

// The cycle of the executing process
CpuScheduler.cycle = 0;

// Schedules the next process to be executed
CpuScheduler.schedule = function() {
    // If the process has run out of time or if there is no currently running process, and
    // there is something actually on the queue, switch the current process with the new process.
    if ((CpuScheduler.quantum === CpuScheduler.cycle || !CpuScheduler.currentProcess) 
            && CpuScheduler.readyQueue.getSize()) {
        Kernel.handleInterupts(CONTEXT_SWITCH_IRQ, null);
    }
};