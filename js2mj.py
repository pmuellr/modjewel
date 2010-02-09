#!/usr/bin/env python

#-------------------------------------------------------------------------------
# The MIT License
# 
# Copyright (c) 2010 Patrick Mueller
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#-------------------------------------------------------------------------------

import os
import sys
import optparse

PROGRAM = os.path.basename(sys.argv[0])
VERSION = "0.1.0"

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def log(message):
    print "%s: %s" % (PROGRAM, message)

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def error(message):
    log(message)
    exit(1)

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def errorException(message):
    eType  = str(sys.exc_info()[0])
    eValue = str(sys.exc_info()[1])
    
    error("%s; exception: %s: %s" % (message, eType, eValue))


#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
class File:

    #---------------------------------------------------------------------------
    #
    #---------------------------------------------------------------------------
    def __init__(self, srcRoot, mjRoot, relName):
        relBase  = relName[:-3]
        iRelName = relName
        oRelName = "%s.mj.js" % relBase
        
        self.srcName = os.path.normpath(os.path.join(srcRoot, iRelName))
        self.mjName  = os.path.normpath(os.path.join(mjRoot, oRelName))
        self.modName = os.path.normpath(relBase)
        
    #---------------------------------------------------------------------------
    #
    #---------------------------------------------------------------------------
    def mjExists(self):
        return os.path.exists(self.mjName)

    #---------------------------------------------------------------------------
    #
    #---------------------------------------------------------------------------
    def mjIsNewer(self):
        if not self.mjExists(): return False
        
        return os.path.getmtime(self.mjName) > os.path.getmtime(self.srcName)  

    #---------------------------------------------------------------------------
    #
    #---------------------------------------------------------------------------
    def srcRead(self):
        try:
            iFile = file(self.srcName)
            contents = iFile.read()
            iFile.close()
            return contents
        except:
            errorException("error reading source file: %s" % self.srcName)

    #---------------------------------------------------------------------------
    #
    #---------------------------------------------------------------------------
    def mjWrite(self, contents):
        oDir = os.path.dirname(self.mjName)
        if oDir == "": oDir = "."
        
        if os.path.exists(oDir):
            if not os.path.isdir(oDir):
                error("unable to create directory: %s" % oDir)
        else:
            try:
                os.makedirs(oDir)
            except:
                errorException("error creating output directory: %s" % oDir)

        try:
            oFile = file(self.mjName, "w")
            oFile.write(contents)
            oFile.close()
        except(e):
            errorException("error writing file: %s" % self.mjName)

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def addFiles(fileList, srcRoot, mjRoot, dir):
    iDir = os.path.join(srcRoot, dir)
    
    entries = os.listdir(iDir)
    for entry in entries:
        fullName = os.path.join(iDir, entry)
        relName  = os.path.join(dir,  entry)
        
        if os.path.isdir(fullName):
            addFiles(fileList, srcRoot, mjRoot, relName)
        else:
            if relName.endswith(".mj.js"): continue
            if not relName.endswith(".js"): continue
             
            fileList.append(File(srcRoot, mjRoot, relName))

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def src2mj(moduleName, content):
    template = 'require.preload("%s", function(require, exports, module) { %s});'

    return template % (moduleName, content)
    
#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def main():

    usage = """usage: 
    %prog [options] dir

    Converts CommonJS module files to modjewel-require static includes.
    The CommonJS module files are in files ending in .js, and the
    the static include files use the same name but the extension
    becomes .mj.js"""
    
    parser = optparse.OptionParser(usage=usage, version="%%prog %s" % VERSION)

    if False:    
        parser.add_option("-r", "--recurse", 
            help="recurse through subdirectories",
            dest="recurse",
            action="store_true", 
            default=False
            )
        
        parser.add_option("-n", "--newer", 
            help="only convert source files newer than generated files",
            dest="newer",
            action="store_true", 
            default=False
            )
        
    parser.add_option("-o", "--outdir", 
        help="output directory (default: same directory as source)",
        dest="dir",
        default=None
        )
        
    (options, args) = parser.parse_args()
    
    if len(args) != 1: error("expecting a directory name as the only argument")
        
    iDir = args[0]
    oDir = options.dir
    if not oDir: oDir=iDir
    
    if not os.path.exists(iDir): error("directory does not exist: %s" % iDir)
    if not os.path.isdir(iDir):  error("argument is not a directory: %s" % iDir)
    
    fileList = []
    addFiles(fileList, iDir, oDir, ".") 

    maxLength = 0
    for file in fileList:
        maxLength = max(maxLength, len(file.srcName))
        
    for file in fileList:
        print "reading: %-*s ; writing: %s" % (maxLength, file.srcName, file.mjName)
        srcContent = file.srcRead()
        mjContent = src2mj(file.modName, srcContent)
        file.mjWrite(mjContent)
    
#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
if __name__ == '__main__':
    main()