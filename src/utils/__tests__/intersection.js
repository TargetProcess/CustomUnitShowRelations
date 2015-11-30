import {expect} from 'chai';

import {intersectRects} from '../intersection';

describe('intersection', () => {

    it('returns points of closest slice between two rects', () => {

        const rect1 = {
            x: 10,
            y: 10,
            width: 30,
            height: 30
        };

        const rect2 = {
            x: 50,
            y: 10,
            width: 30,
            height: 30
        };

        expect(intersectRects(rect1, rect2))
            .to.be.eql({
                start: {
                    x: 40,
                    y: 25
                },
                end: {
                    x: 50,
                    y: 25
                }
            });

    });

});
