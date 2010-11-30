#!/usr/bin/env python

import os
import re
import sys
import shutil
import subprocess

PROGRAM = sys.argv[0]

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def main():

    # get directories
    baseDir  = os.path.dirname(PROGRAM)
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
        
    os.makedirs(outDir)

    tests = getTests("tests")
    
    # copy testsDir into outDir
#   shutil.copytree(testsDir, outDir)

    # now all work done in outDir
    os.chdir("out")

    # build the individual tests
    iframes = []
    for test in tests:
        iframes.append("<iframe width='100%%' height='30' src='%s/launcher-in-iframe.html'></iframe>" % (test))
        buildTest(test)

    iframesLines = "\n".join(iframes)
    
    # build the browser launcher
    html = fileContents("../launcher-main.html.template")

    html = html.replace("@iframes@", iframesLines)
    
    oFileName = "launcher-all.html"
    oFile = file(oFileName, "w")
    oFile.write(html)
    oFile.close()
    
    print
    print "Generated browser test: %s" % os.path.abspath(oFileName)
    print "This file needs to be opened from an http:// url, not as a local file."

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def buildTest(testDir):

    # copy libraries
    output = run(["../../module2transportd.py", "-q", "-o", testDir, "../../lib"])
    
    #copy source
    output = run(["../../module2transportd.py", "-q", "-o", testDir, os.path.join("..", testDir)])
    
    # copy modjewel-require.js
    shutil.copy("../../modjewel-require.js", os.path.join(testDir, "modjewel-require.js"))
    
    html = fileContents("../launcher-in-iframe.html.template")
    
    # get the list of modules
    modules = [module for module in getModules(testDir)]
    scripts = ["<script src='%s'></script>" % module for module in modules]
    
    scriptsLines = "\n".join(scripts)
    
    html = html.replace("@scripts@", scriptsLines)
    html = html.replace("@title@", testDir)

    # build HTML launcher for iframe
    oFileName = os.path.join(testDir, "launcher-in-iframe.html")
    oFile = file(oFileName, "w")
    oFile.write(html)
    oFile.close()
    
#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def getModules(testDir):
    modules = []
    for root, dirs, files in os.walk(testDir):
        for file in files:
            if not file.endswith(".transportd.js"): continue
            
            modules.append(os.path.relpath(os.path.join(root, file), testDir))

    return modules

#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def getTests(testDir):
    tests = []
    for root, dirs, files in os.walk(testDir):
        if "program.js" in files:
            tests.append(root)
            
    return tests
    
#-------------------------------------------------------------------------------
#
#-------------------------------------------------------------------------------
def run(cmdArgs):
    result = subprocess.Popen(cmdArgs, stdout=subprocess.PIPE).communicate()[0]
    if not re.match(r"\s*", result):
        print result

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