/* 
 * Requires global.js.
 * 
 * Routines for the host CPU simulation, NOT for the OS itself.  
 * In this manner, it's similiar to a hypervisor,
 * in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
 * that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
 * JavaScript in both the host and client environments.
 */

function Cpu() {
    this.PC = 0;
    this.Acc = 0;
    this.Xreg = 0;
    this.Yreg = 0;
    this.Zflag = 0;
    this.isExecuting = false;
    
    this.init();
}

Cpu.prototype.init = function() {
    this.PC = 0;
    this.Acc = 0;
    this.Xreg = 0;
    this.Yreg = 0;
    this.Zflag = 0;
    this.isExecuting = false;
};

Cpu.prototype.cycle = function() {
    Kernel.trace("CPU cycle");
    // TODO: Accumulate CPU usage and profiling statistics here
    // TODO: Do the real work here. Be sure to set this.isExecuting appropriately
};