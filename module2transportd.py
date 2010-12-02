#!/usr/bin/env python

#-------------------------------------------------------------------------------
# Copyright (c) 2010 Patrick Mueller
# 
# The MIT License - see: http://www.opensource.org/licenses/mit-license.php
#-------------------------------------------------------------------------------

import os
import sys
import optparse

PROGRAM = os.path.basename(sys.argv[0])
VERSION = "1.1.0"

OutDir              = "."
Quiet               = False
TransportDExtension = ".transportd.js"

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def main():
    global OutDir
    global Quiet

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
        help="generate transportD files in DIR (default: %default)"
    )
    
    parser.add_option("--htmlFile", dest="htmlFile", metavar = "FILE",
        help="generate an test driver for HTML in FILE"
    )

    parser.add_option("--htmlMain", dest="htmlMain", metavar = "CODE",
        help="a line of code to start the test driver for HTML"
    )

    parser.add_option("-q", "--quiet", dest="quiet", action="store_true", default=Quiet,
        help="be quiet"
    )

    parser.set_defaults(dirName=OutDir)
    
    (options, args) = parser.parse_args()
    
    OutDir = options.dirName
    Quiet  = options.quiet
    
    help = False
    if len(args) == 0:   help = True
    elif args[0] == "?": help = True
    
    if help:
        parser.print_help()
        sys.exit(0)
       
    htmlFile = options.htmlFile
    htmlMain = options.htmlMain

    if htmlFile and not htmlMain: error("--htmlFile specified but not --htmlMain")
    if htmlMain and not htmlFile: error("--htmlMain specified but not --htmlFile")
    
    for dir in args:
        modules = processDir(dir)

    if not htmlFile and not htmlMain: return

    contents = []

    contents.append("<script src='modjewel-require.js'></script>")
    contents.append("")

    for module in modules:
        contents.append("<script src='%s%s'></script>" % (module, TransportDExtension))

    contents.append("")
    contents.append("<script>")
    contents.append(htmlMain)
    contents.append("</script>")
    contents.append("")
    contents.append("<h1>check the console for test results</h1>")

    htmlFileName = os.path.join(OutDir, htmlFile)
    
    htmlFile = file(htmlFileName, "w")
    htmlFile.write("\n".join(contents))
    htmlFile.close()
    
    log("generated test driver: %s" % htmlFileName)
        
#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def processDir(dir, path=None, modules=None):
    if path    is None: path = []
    if modules is None: modules = []
    
    if not os.path.exists(dir): error("directory does not exist: %s" % dir)
    if not os.path.isdir(dir): error("path is not directory: %s" % dir)
    
    entries = os.listdir(dir)
    
    for entry in entries:
        fullEntry = os.path.join(dir, entry)
        
        if os.path.isdir(fullEntry):
            processDir(fullEntry, path + [entry], modules)
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
        
        if contents.startswith("#!"): contents = "// " + contents
        
        moduleName = "%s/%s" % ("/".join(path), baseName)
        moduleName = moduleName.lstrip("/")
        
        modules.append(moduleName)
        
        header  = ';require.define({"%s": function(require, exports, module) {' % moduleName
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
        
    return modules

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def log(message):
    if Quiet: return
    print "%s: %s" % (PROGRAM, message)

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def error(message):
    print "%s: %s" % (PROGRAM, message)
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