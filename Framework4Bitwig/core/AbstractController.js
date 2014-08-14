// Written by J�rgen Mo�graber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function AbstractController ()
{
    this.surface = null;
}

/*AbstractController.prototype.init = function ()
{
};

AbstractController.prototype.attach = function (surface, config)
{
    this.surface = surface;
    this.surface.configure (config);
};*/

AbstractController.prototype.shutdown = function ()
{
    this.surface.shutdown ();
};

AbstractController.prototype.flush = function ()
{
    this.surface.flush ();
};