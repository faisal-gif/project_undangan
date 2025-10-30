<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Guest/Welcome/Index');
    }

    public function winners()
    {
        return Inertia::render('Guest/Winners/Index');
    }
}
