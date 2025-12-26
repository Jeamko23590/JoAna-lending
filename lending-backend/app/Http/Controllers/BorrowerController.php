<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BorrowerController extends Controller
{
    public function index(Request $request)
    {
        $query = Borrower::query();

        if ($request->search) {
            $query->where('full_name', 'like', "%{$request->search}%")
                  ->orWhere('contact_number', 'like', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $borrowers = $query->withCount(['loans', 'activeLoans'])
                          ->orderBy('created_at', 'desc')
                          ->paginate($request->per_page ?? 15);

        return response()->json($borrowers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'address' => 'required|string',
            'contact_number' => 'required|string|max:20',
            'valid_id' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'notes' => 'nullable|string',
        ]);

        $validated['date_registered'] = now();
        $validated['status'] = 'active';

        if ($request->hasFile('valid_id')) {
            $validated['valid_id_path'] = $request->file('valid_id')->store('valid_ids', 'public');
        }

        unset($validated['valid_id']);
        $borrower = Borrower::create($validated);

        ActivityLogService::log('created', 'Borrower', $borrower->id, null, $borrower->toArray());

        return response()->json($borrower, 201);
    }

    public function show(Borrower $borrower)
    {
        $borrower->load(['loans.payments']);
        return response()->json($borrower);
    }

    public function update(Request $request, Borrower $borrower)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'address' => 'required|string',
            'contact_number' => 'required|string|max:20',
            'valid_id' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'notes' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $oldValues = $borrower->toArray();

        if ($request->hasFile('valid_id')) {
            if ($borrower->valid_id_path) {
                Storage::disk('public')->delete($borrower->valid_id_path);
            }
            $validated['valid_id_path'] = $request->file('valid_id')->store('valid_ids', 'public');
        }

        unset($validated['valid_id']);
        $borrower->update($validated);

        ActivityLogService::log('updated', 'Borrower', $borrower->id, $oldValues, $borrower->toArray());

        return response()->json($borrower);
    }

    public function destroy(Borrower $borrower)
    {
        $oldValues = $borrower->toArray();
        
        if ($borrower->valid_id_path) {
            Storage::disk('public')->delete($borrower->valid_id_path);
        }

        $borrower->delete();

        ActivityLogService::log('deleted', 'Borrower', $borrower->id, $oldValues);

        return response()->json(['message' => 'Borrower deleted successfully']);
    }

    public function list()
    {
        $borrowers = Borrower::where('status', 'active')
                            ->select('id', 'full_name')
                            ->orderBy('full_name')
                            ->get();

        return response()->json($borrowers);
    }
}
