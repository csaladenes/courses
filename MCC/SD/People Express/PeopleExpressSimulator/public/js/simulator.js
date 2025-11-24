class PeopleExpressSim {
    constructor(maxQuarters = 20) {
        this.maxQuarters = maxQuarters;
        this.reset();
    }

    reset() {
        // Initial State (Year 1 Quarter 1)
        this.quarter = 0;
        
        // Stocks
        this.fleet = 3; // Starting planes
        this.staff = 50; // Starting staff
        this.reputation = 1.0; // 100% reputation
        this.cash = 5000000; // $5M starting capital
        
        // Parameters (Constants)
        this.seatsPerPlane = 120;
        this.quarterlyPlaneCost = 500000; // Lease/Maintenance per plane
        this.quarterlyStaffCost = 15000; // Salary per employee
        this.marketingEffectiveness = 0.5; 
        this.hiringCost = 2000;
        this.planePurchaseCost = 2000000; // Down payment for leasing/new routes setup

        // Demand Params
        this.marketSize = 200000; // Potential quarterly passengers in region
        this.referencePrice = 100; // Competitor price
        this.priceSensitivity = 2.0; // How much price affects demand

        // Service Quality Params
        this.optimalStaffPerPassenger = 0.002; // 1 staff per 500 passengers
        this.reputationDelay = 0.5; // Smoothing factor (0-1), lower is slower adaptation

        // Decisions (Inputs)
        this.price = 60;
        this.marketingSpend = 50000;
        this.targetHiring = 5;
        this.planeOrders = 0;

        // History for charting AND State Restoration
        this.history = [];
        
        // Store full state snapshots for time travel
        this.snapshots = [];
        
        this.logState();
    }

    // Capture a full snapshot of the current state
    createSnapshot() {
        return {
            quarter: this.quarter,
            fleet: this.fleet,
            staff: this.staff,
            reputation: this.reputation,
            cash: this.cash,
            price: this.price,
            marketingSpend: this.marketingSpend,
            targetHiring: this.targetHiring,
            planeOrders: this.planeOrders
        };
    }

    // Restore state from a snapshot
    restoreSnapshot(snapshot) {
        this.quarter = snapshot.quarter;
        this.fleet = snapshot.fleet;
        this.staff = snapshot.staff;
        this.reputation = snapshot.reputation;
        this.cash = snapshot.cash;
        this.price = snapshot.price;
        this.marketingSpend = snapshot.marketingSpend;
        this.targetHiring = snapshot.targetHiring;
        this.planeOrders = snapshot.planeOrders;
    }

    stepBack() {
        if (this.quarter > 0) {
            // Go back to previous quarter (remove last history entry)
            this.history.pop(); 
            this.snapshots.pop(); 
            
            // Restore the state from the NEW last snapshot (which represents the end of the previous turn)
            const lastSnapshot = this.snapshots[this.snapshots.length - 1];
            this.restoreSnapshot(lastSnapshot);
            
            // Return the history entry for UI update
            return this.history[this.history.length - 1];
        }
        return null;
    }

    // Main Simulation Step (Quarter)
    tick(decisions) {
        // 1. Apply Decisions
        this.price = Math.max(10, decisions.price);
        this.marketingSpend = Math.max(0, decisions.marketingSpend);
        let hires = Math.max(-this.staff, decisions.hires); // Can fire, but not more than have
        let planesOrdered = Math.max(0, decisions.planesOrdered);

        // 2. Calculate Capacity
        const seatCapacity = this.fleet * this.seatsPerPlane * 90; // 90 days/flights per quarter approx per plane (1 flight/day)
        
        // 3. Calculate Demand
        // Demand = Market * PriceFactor * ReputationFactor * MarketingFactor
        const priceRatio = this.price / this.referencePrice;
        const priceFactor = Math.max(0, 2 - Math.pow(priceRatio, this.priceSensitivity)); // Simplified demand curve
        const marketingFactor = 1 + (Math.log(1 + this.marketingSpend / 10000) * 0.1);
        
        let potentialDemand = this.marketSize * priceFactor * this.reputation * marketingFactor;
        
        // 4. Determine Actual Passengers (constrained by capacity)
        let passengers = Math.min(potentialDemand, seatCapacity);
        let loadFactor = seatCapacity > 0 ? passengers / seatCapacity : 0;

        // 5. Calculate Service Quality
        // Needed staff = Passengers * Ratio
        // If staff < Needed, Quality drops dramatically
        const neededStaff = passengers * this.optimalStaffPerPassenger;
        // Avoid division by zero
        let serviceRatio = neededStaff > 0 ? this.staff / neededStaff : 1;
        // Quality curve: 1.0 if well staffed, drops sharply if understaffed
        let serviceQuality = Math.min(1.2, serviceRatio); // Can be slightly better than 1
        if (serviceRatio < 1) {
            serviceQuality = Math.pow(serviceRatio, 2); // Nonlinear penalty
        }

        // 6. Update Reputation (Stock)
        // Reputation moves towards ServiceQuality over time
        this.reputation = this.reputation + this.reputationDelay * (serviceQuality - this.reputation);

        // 7. Financials
        const revenue = passengers * this.price;
        
        const staffCosts = this.staff * this.quarterlyStaffCost;
        const fleetCosts = this.fleet * this.quarterlyPlaneCost;
        const hiringCosts = Math.abs(hires) * this.hiringCost;
        
        const totalCosts = staffCosts + fleetCosts + hiringCosts + this.marketingSpend + (planesOrdered * this.planePurchaseCost);
        const profit = revenue - totalCosts;

        this.cash += profit;

        // 8. Update Stocks for next round
        this.staff += hires;
        this.fleet += planesOrdered;
        this.quarter++;

        // 9. Log State
        const state = {
            quarter: this.quarter,
            cash: this.cash,
            profit: profit,
            revenue: revenue,
            passengers: passengers,
            fleet: this.fleet,
            staff: this.staff,
            reputation: this.reputation,
            serviceQuality: serviceQuality,
            loadFactor: loadFactor
        };
        this.history.push(state);
        
        // Save snapshot of state AFTER this tick
        this.snapshots.push(this.createSnapshot());

        return state;
    }

    logState() {
        // Initial log
        this.history.push({
            quarter: this.quarter,
            cash: this.cash,
            profit: 0,
            revenue: 0,
            passengers: 0,
            fleet: this.fleet,
            staff: this.staff,
            reputation: this.reputation,
            serviceQuality: 1,
            loadFactor: 0
        });
        this.snapshots.push(this.createSnapshot());
    }

    getHistory() {
        return this.history;
    }
}
