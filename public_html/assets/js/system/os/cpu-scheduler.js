function CpuScheduler() {};

CpuScheduler.readyQueue = new Queue();
CpuScheduler.quantum = 6;
CpuScheduler.currentProcess = null;
CpuScheduler.cycle = 0;

CpuScheduler.schedule = function() {
    if (!CpuScheduler.currentProcess && CpuScheduler.readyQueue.getSize() > 0) {
        Kernel.trace("Starting process");
        CpuScheduler.currentProcess = CpuScheduler.readyQueue.dequeue();
        CpuScheduler.currentProcess.state = ProcessControlBlock.State.RUNNING;
        _CPU.start(CpuScheduler.currentProcess);
    } else if (CpuScheduler.currentProcess && CpuScheduler.currentProcess.state === ProcessControlBlock.State.TERMINATED) {
        Kernel.trace("Process terminated - changing process");
        CpuScheduler.cycle = 0;
        ProcessManager.unload(CpuScheduler.currentProcess);        
        CpuScheduler.currentProcess = null;    
        _CPU.stop();

        if (CpuScheduler.readyQueue.getSize() > 0) {  
            CpuScheduler.currentProcess = CpuScheduler.readyQueue.dequeue();
                CpuScheduler.currentProcess.state = ProcessControlBlock.State.RUNNING;
                _CPU.start(CpuScheduler.currentProcess);
        }
    } else if (CpuScheduler.quantum === CpuScheduler.cycle) {
        Kernel.trace("Quantum expired - changing process");
        CpuScheduler.cycle = 0;

        CpuScheduler.currentProcess.state = ProcessControlBlock.State.WAITING;
        CpuScheduler.readyQueue.enqueue(CpuScheduler.currentProcess);
        _CPU.stop();
        
        if (CpuScheduler.readyQueue.getSize() > 0) {  
            CpuScheduler.currentProcess = CpuScheduler.readyQueue.dequeue();
                CpuScheduler.currentProcess.state = ProcessControlBlock.State.RUNNING;
                _CPU.start(CpuScheduler.currentProcess);
        }
    }
};