module counter::counter {
    /// A simple owned Counter object.
    public struct Counter has key, store {
        id: UID,
        value: u64,
    }

    /// Create a new Counter and return it to the caller.
    public fun create(ctx: &mut TxContext): Counter {
        Counter { id: object::new(ctx), value: 0 }
    }

    /// Increment by 1.
    public fun inc(counter: &mut Counter) {
        counter.value = counter.value + 1;
    }

    /// Decrement by 1 (guards against underflow).
    public fun dec(counter: &mut Counter) {
        assert!(counter.value > 0, 0);
        counter.value = counter.value - 1;
    }

    /// Read helper (pure).
    public fun get_value(counter: &Counter): u64 {
        counter.value
    }
}
