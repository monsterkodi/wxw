/*
000   000   0000000   000      000   000  00     00  00000000
000   000  000   000  000      000   000  000   000  000
 000 000   000   000  000      000   000  000000000  0000000
   000     000   000  000      000   000  000 0 000  000
    0       0000000   0000000   0000000   000   000  00000000
*/

import Foundation
import AudioToolbox

func volume(_ id:String)
{
    var defaultOutputDeviceID = AudioDeviceID(0)
    var defaultOutputDeviceIDSize = UInt32(MemoryLayout.size(ofValue: defaultOutputDeviceID))

    var getDefaultOutputDevicePropertyAddress = AudioObjectPropertyAddress(
        mSelector: kAudioHardwarePropertyDefaultOutputDevice,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: AudioObjectPropertyElement(kAudioObjectPropertyElementMaster))

    _ = AudioObjectGetPropertyData(
        AudioObjectID(kAudioObjectSystemObject),
        &getDefaultOutputDevicePropertyAddress,
        0,
        nil,
        &defaultOutputDeviceIDSize,
        &defaultOutputDeviceID)

    var volume = Float32(0.0)
    var volumeSize = UInt32(MemoryLayout.size(ofValue: volume))
    var volumePropertyAddress = AudioObjectPropertyAddress(
        mSelector: kAudioHardwareServiceDeviceProperty_VirtualMasterVolume,
        mScope: kAudioDevicePropertyScopeOutput,
        mElement: kAudioObjectPropertyElementMaster)
    
    if (id.count > 0)
    {
        var volume = Float32(id)!/100

        if volume < 0 { volume = 0 }
        if volume > 1 { volume = 1 }

        _ = AudioObjectSetPropertyData(
            defaultOutputDeviceID,
            &volumePropertyAddress,
            0,
            nil,
            volumeSize,
            &volume)
    }
    
    _ = AudioObjectGetPropertyData(
        defaultOutputDeviceID,
        &volumePropertyAddress,
        0,
        nil,
        &volumeSize,
        &volume)
    
    klog(Int(volume*100))
}
