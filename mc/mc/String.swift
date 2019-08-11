/*
 0000000  000000000  00000000   000  000   000   0000000     
000          000     000   000  000  0000  000  000          
0000000      000     0000000    000  000 0 000  000  0000    
     000     000     000   000  000  000  0000  000   000    
0000000      000     000   000  000  000   000   0000000     
*/

import Foundation

extension StringProtocol 
{
    subscript(offset: Int) -> Element 
    {
        return self[index(startIndex, offsetBy: offset)]
    }
    subscript(_ range: Range<Int>) -> SubSequence 
    {
        return prefix(range.lowerBound + range.count).suffix(range.count)
    }
    subscript(range: ClosedRange<Int>) -> SubSequence 
    {
        return prefix(range.lowerBound + range.count).suffix(range.count)
    }
    subscript(range: PartialRangeThrough<Int>) -> SubSequence 
    {
        return prefix(range.upperBound.advanced(by: 1))
    }
    subscript(range: PartialRangeUpTo<Int>) -> SubSequence 
    {
        return prefix(range.upperBound)
    }
    subscript(range: PartialRangeFrom<Int>) -> SubSequence 
    {
        return suffix(Swift.max(0, count - range.lowerBound))
    }
}

extension String 
{
    mutating func replaceSubrange(_ range: CountableClosedRange<Int>, with: String) -> String 
    {
        self.replaceSubrange(Range(NSMakeRange(range.lowerBound,range.upperBound), in:self)!, with:with)
        return self
    }
    
    func replace(_ substr:String, with:String) -> String
    {
        return self.replacingOccurrences(of:substr, with:with, options:.literal, range:nil)
    }
    
    func startsWith(_ prefix:String) -> Bool
    {
        return self.hasPrefix(prefix)
    }
}

//  0000000  00     00  00000000   
// 000       000   000  000   000  
// 000       000000000  00000000   
// 000       000 0 000  000        
//  0000000  000   000  000        

func cmp(_ a:String, _ b:String) -> Bool
{
    return a.lowercased() == b.lowercased();
}

//  0000000   0000000   000   000  000000000   0000000   000  000   000   0000000  
// 000       000   000  0000  000     000     000   000  000  0000  000  000       
// 000       000   000  000 0 000     000     000000000  000  000 0 000  0000000   
// 000       000   000  000  0000     000     000   000  000  000  0000       000  
//  0000000   0000000   000   000     000     000   000  000  000   000  0000000   

func contains(_ a:String, _ b:String) -> Bool
{
    return a.lowercased().contains(b.lowercased())
}

