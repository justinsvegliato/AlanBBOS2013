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

//
// Global Variables
//
var _CPU = null;
var _OSclock = 0;
var _Mode = 0;
var _Trace = true;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false
;
// For testing purposes...
var _GLaDOS = null;
var krnInterruptHandler = null;
var _KernelInputQueue = null;