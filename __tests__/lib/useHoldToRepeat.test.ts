import { act, renderHook } from "@testing-library/react";
import { useHoldToRepeat } from "~/lib/hooks/useHoldToRepeat";

type Bound = ReturnType<ReturnType<typeof useHoldToRepeat>["bind"]>;

const down = (bound: Bound, pointerId = 1) =>
  bound.onPointerDown({
    pointerType: "touch",
    button: 0,
    pointerId,
    preventDefault: () => {},
  } as unknown as React.PointerEvent);

function windowRelease(pointerId: number) {
  const event = new Event("pointerup") as Event & { pointerId: number };
  event.pointerId = pointerId;
  window.dispatchEvent(event);
}

describe("useHoldToRepeat", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  function setup() {
    const onTap = jest.fn();
    const onRepeat = jest.fn();
    const hook = renderHook(() => useHoldToRepeat());
    const bind = (key = "a") =>
      hook.result.current.bind(key, { onTap, onRepeat });
    return { hook, bind, onTap, onRepeat };
  }

  it("a quick tap fires once and never starts repeating", () => {
    const { bind, onTap, onRepeat } = setup();
    act(() => {
      down(bind());
      bind().onPointerUp(); // released immediately (the old 10ms race)
    });
    act(() => jest.advanceTimersByTime(10_000));
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onRepeat).not.toHaveBeenCalled();
  });

  it("holding repeats after the delay, then stops on release", () => {
    const { bind, onTap, onRepeat } = setup();
    act(() => down(bind()));
    act(() => jest.advanceTimersByTime(1000));
    expect(onRepeat).toHaveBeenCalledTimes(1);
    act(() => jest.advanceTimersByTime(1000));
    expect(onRepeat).toHaveBeenCalledTimes(3);
    act(() => bind().onPointerUp());
    act(() => jest.advanceTimersByTime(10_000));
    expect(onRepeat).toHaveBeenCalledTimes(3);
    expect(onTap).not.toHaveBeenCalled(); // a hold isn't also a tap
  });

  it("stops a hold whose button missed its pointerup (e.g. became disabled)", () => {
    const { bind, onRepeat } = setup();
    act(() => down(bind(), 7));
    act(() => jest.advanceTimersByTime(1500));
    act(() => windowRelease(7)); // released elsewhere on the page
    const calls = onRepeat.mock.calls.length;
    act(() => jest.advanceTimersByTime(10_000));
    expect(onRepeat).toHaveBeenCalledTimes(calls);
  });

  it("other people's taps don't stop a hold", () => {
    const { bind, onRepeat } = setup();
    act(() => down(bind("player-1"), 1));
    act(() => windowRelease(2)); // someone else lifts a finger
    act(() => jest.advanceTimersByTime(2000));
    expect(onRepeat).toHaveBeenCalledTimes(3);
  });

  it("tracks simultaneous holds independently", () => {
    const onA = jest.fn();
    const onB = jest.fn();
    const { result } = renderHook(() => useHoldToRepeat());
    act(() => {
      down(result.current.bind("a", { onTap: jest.fn(), onRepeat: onA }), 1);
      down(result.current.bind("b", { onTap: jest.fn(), onRepeat: onB }), 2);
    });
    expect(result.current.isActive("a")).toBe(true);
    act(() => jest.advanceTimersByTime(1000));
    act(() =>
      result.current
        .bind("a", { onTap: jest.fn(), onRepeat: onA })
        .onPointerUp()
    );
    act(() => jest.advanceTimersByTime(1000));
    expect(onA).toHaveBeenCalledTimes(1);
    expect(onB).toHaveBeenCalledTimes(3);
    expect(result.current.isActive("a")).toBe(false);
    expect(result.current.isActive("b")).toBe(true);
  });

  it("leaving the button cancels without a tap", () => {
    const { bind, onTap, onRepeat } = setup();
    act(() => {
      down(bind());
      bind().onPointerLeave();
    });
    act(() => jest.advanceTimersByTime(5000));
    expect(onTap).not.toHaveBeenCalled();
    expect(onRepeat).not.toHaveBeenCalled();
  });

  it("stops everything on unmount and when the window loses focus", () => {
    const { hook, bind, onRepeat } = setup();
    act(() => down(bind("a")));
    act(() => window.dispatchEvent(new Event("blur")));
    act(() => jest.advanceTimersByTime(5000));
    expect(onRepeat).not.toHaveBeenCalled();

    act(() => down(bind("b")));
    hook.unmount();
    act(() => jest.advanceTimersByTime(5000));
    expect(onRepeat).not.toHaveBeenCalled();
  });
});
