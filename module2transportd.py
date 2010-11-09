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
VERSION = "0.3.0"

OutDir              = "."
TransportDExtension = ".transportd.js"

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def main():
    global OutDir

    usage        = "usage: %s [options] inDir inDir ..." % PROGRAM
    version      = "%s %s" % (PROGRAM,VERSION)
    description  = """
Converts .js files in the inDir directories to Transport/D format.
See: http://wiki.commonjs.org/wiki/Modules/Transport/D for more info.
Each inDir is considered a 'root' directory for generating relative
module names.
""".strip()
    parser = optparse.OptionParser(usage=usage, version=version, description=description)
    
    parser.add_option("-o", "--out", dest="dirName", metavar = "DIR",
        help="generate transportD files in DIR (default: %default)")
    
    parser.set_defaults(dirName=OutDir)
    
    (options, args) = parser.parse_args()
    
    OutDir = options.dirName
    
    help = False
    if len(args) == 0:   help = True
    elif args[0] == "?": help = True
    
    if help:
        parser.print_help()
        sys.exit(0)
        
    for dir in args:
        processDir(dir)
        
#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def processDir(dir, path=None):
    if path is None: path = []
    
    if not os.path.exists(dir): error("directory does not exist: %s" % dir)
    if not os.path.isdir(dir): error("path is not directory: %s" % dir)
    
    entries = os.listdir(dir)
    
    for entry in entries:
        fullEntry = os.path.join(dir, entry)
        
        if os.path.isdir(fullEntry):
            processDir(fullEntry, path + [entry])
            continue
        
        if not os.path.isfile(fullEntry):           continue
        if     entry.endswith(TransportDExtension): continue
        if not entry.endswith(".js"):               continue
    
        baseName  = entry[:-3]
        iFileName = fullEntry
        oDir      = "/".join(path)
        oFileName = os.path.join(OutDir, oDir, baseName)
        oFileName = "%s%s" % (oFileName, TransportDExtension)
        
        if False:
            print "processing:   %s" % fullEntry
            print "   oFileName: %s" % oFileName
            continue
    
        iFile = file(iFileName)
        contents = iFile.read()
        iFile.close()
        
        moduleName = "%s/%s" % ("/".join(path), baseName)
        moduleName = moduleName.lstrip("/")
        
        header  = 'require.define({"%s": function(require, exports, module) {' % moduleName
        trailer = '}});'

        newContents = "%s %s\n%s\n" % (header, contents, trailer)
        
        
        oDirName = os.path.dirname(oFileName)
        if os.path.exists(oDirName):
            if not os.path.isdir(oDirName):
                error("trying to generate a file in '%s' which isn't a directory" % oDirName)
                
        if not os.path.exists(oDirName):
            try:
                os.makedirs(oDirName)
            except:
                error("error creating output directory '%s'" % oDirName)
                
        oFile = file(oFileName, "w")
        oFile.write(newContents)
        oFile.close()
        
        log("generated: %s" % oFileName)

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def help():
    usage = """
    
    usage: 
       %s dir dir ...

    Converts CommonJS module files to transport/D format.
    
    For each directory passed, converts all .js files in the directory,
    recursively, to transport/D format, using the existing subdirectory
    structure as the module path structure.  Modules in the top-level
    directory are considered 'top level'.
    
    The generated files are suffixed as '.transportc.js', and co-located
    in the same directory as the original .js files.
    """ % PROGRAM
    
    print usage
    sys.exit()

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
if __name__ == '__main__':
    main()