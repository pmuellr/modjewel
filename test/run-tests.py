#!/usr/bin/env python

import os
import sys
import shutil
import subprocess

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def main():

    # get directories
    baseDir  = os.path.dirname(sys.argv[0])
    os.chdir(baseDir)

    testsDir = os.path.abspath("tests")
    outDir   = os.path.abspath("out")

    # validate testsDir
    if not os.path.exists(testsDir):
        error("tests dir does not exist: %s" % testsDir)
    
    if not os.path.isdir(testsDir):
        error("tests dir is not a directory: %s" % testsDir)

    # validate and reset outDir
    if os.path.exists(outDir):
        if not os.path.isdir(outDir):
            error("out dir is not a directory: %s" % outDir)

        shutil.rmtree(outDir)

    # copy testsDir into outDir
    shutil.copytree(testsDir, outDir)

    # now all work done in outDir
    os.chdir("out")

    # get tests
    tests = getTests()
    
    # build the individual tests
    iframes = []
    for test in tests:
        iframes.append("<iframe width='100%%' height='30' src='%s/launcher-in-iframe.html'></iframe>" % (test))
        buildTest(test)

    iframesLines = "\n".join(iframes)
    
    # run the rhino tests
    for test in tests:
        rhinoLauncher = os.path.join(test, "launcher-rhino.js")

        print "running %s" % rhinoLauncher
        output = run(["rhino", rhinoLauncher])
        print output

    
    # build the browser launcher
    html = getLauncherMainHTML()

    html = html.replace("@iframes@", iframesLines)
    
    oFileName = "launcher-all.html"
    oFile = file(oFileName, "w")
    oFile.write(html)
    oFile.close()
    
    print
    print "generated browser test: %s" % os.path.abspath(oFileName)

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def buildTest(testDir):

    # copy libraries
    copyLibs(testDir)
    
    html = getLauncherInIFrameHTML()
    
    # get the list of modules
    origDir = os.getcwd()
    os.chdir(testDir)
    
    jsFiles = [jsFile[2:-3] for jsFile in getJsFiles(".")]
    
    scripts = []
    for jsFile in jsFiles:
        scripts.append("<script src='%s.transportd.js'></script>" % (jsFile))
        
    scriptsLines = "\n".join(scripts)
    
    html = html.replace("@scripts@", scriptsLines)
    html = html.replace("@title@", testDir[2:])

    # build HTML launcher for iframe
    oFile = file("launcher-in-iframe.html", "w")
    oFile.write(html)
    oFile.close()
    
    # back to original directory
    os.chdir(origDir)

    # build transport/D modules
    output = run(["../../module2transportd.py", testDir])

    # copy modjewel
    shutil.copy("../../modjewel-require.js", testDir)

    # build single file with all modules for rhino
    rhinoLauncher = os.path.join(testDir, "launcher-rhino.js")
    oFile = file(rhinoLauncher, "w")

    sep = "\n\n//" + ("=" * 77) + "\n\n"
    
    content = fileContents(os.path.join(testDir, "modjewel-require.js"))
    oFile.write(sep)
    oFile.write(content)
    
    for jsFile in jsFiles:
        content = fileContents(os.path.join(testDir, "%s.transportd.js" % jsFile))
        oFile.write(sep)
        oFile.write(content)
    
    oFile.write(sep)
    oFile.write("require('program')\n")
    
    oFile.close()

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def getLauncherInIFrameHTML():
    iFile = file("../launcher-in-iframe.html.template")
    contents = iFile.read()
    iFile.close()
    
    return contents

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def getLauncherMainHTML():
    iFile = file("../launcher-main.html.template")
    contents = iFile.read()
    iFile.close()

    return contents

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def copyLibs(test):
    if os.path.exists(os.path.join(test, "test.js")): return
    
    for entry in os.listdir("../../lib"):
        shutil.copy(os.path.join("../../lib", entry), test)

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def getJsFiles(test):
    jsFiles = []
    for root, dirs, files in os.walk(test):
        for file in files:
            if file == "modjewel-require.js": continue
            if file.endswith(".transportd.js"): continue
            
            jsFiles.append(os.path.join(root, file))

    return jsFiles

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def getTests():
    tests = []
    for root, dirs, files in os.walk("."):
        if "program.js" in files:
            tests.append(root)
            
    return tests
    
#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def run(cmdArgs):
    return subprocess.Popen(cmdArgs, stdout=subprocess.PIPE).communicate()[0]

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def fileContents(iFileName):
    iFile = file(iFileName)
    contents = iFile.read()
    iFile.close()
    
    return contents

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
main()