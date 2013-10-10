/**
 * Global constants and variables over both the OS and host.
 * Note: These are global over both the OS and Hardware Simulation/Host.
 * 
 * This code references page numbers in the text book: 
 * Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  
 * ISBN 978-0-470-12872-5
 */

//
// Global CONSTANTS
//
var APP_NAME = "SvegOS";
var APP_VERSION = "0.01";
var CPU_CLOCK_INTERVAL = 50;
var TIMER_IRQ = 0;
var KEYBOARD_IRQ = 1;
var SYSTEM_CALL_IRQ = 2;
var PROCESS_EXECUTION_IRQ = 3;
var MEMORY_ACCESS_FAULT_IRQ = 4;
var STEP_IRQ = 5;
var STEP_MODE_IRQ = 6;
var PROCESS_FAULT_IRQ = 7;
var PROCESS_LOAD_FAULT_IRQ = 8;

//
// Global Variables
//
var _CPU = null;
var _OSclock = 0;
var _Mode = 0;
var _Trace = true;

// For testing purposes...
var _GLaDOS = null;
var krnInterruptHandler = null;
var _KernelInputQueue = null;