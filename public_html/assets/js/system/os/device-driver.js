/**
 * The base class (or 'prototype') for all Device Drivers.
 */

// Constructor that as of right now does nothing...
function DeviceDriver() {};

// Base Attributes
DeviceDriver.version = "0.07";
DeviceDriver.status = "unloaded";
DeviceDriver.preemptable = false;
// TODO: We may want queueing requests to be handled by deferred procedure calls (DPCs)
// this.queue = new Queue();

// Base Method pointers (these will be overridden be driver extensions)
DeviceDriver.prototype.driverEntry = null;
DeviceDriver.prototype.isr = null;
// TODO: Deferred Procedure Call routine - Start next queued operation on this device)
// DriverDriver.dpc = null; 