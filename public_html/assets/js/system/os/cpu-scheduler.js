function CpuScheduler() {};

CpuScheduler.readyQueue = new Queue();
CpuScheduler.quantum = 6;
CpuScheduler.currentProcess = null;
CpuScheduler.cycle = 0;

CpuScheduler.schedule = function() {
    if ((CpuScheduler.quantum === CpuScheduler.cycle || !CpuScheduler.currentProcess) && CpuScheduler.readyQueue.getSize()) {
        Kernel.handleInterupts(CONTEXT_SWITCH_IRQ, null);
    }
};