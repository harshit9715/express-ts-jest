import { rest } from 'msw'

export const handlers = [
    // Handles a GET /user request
    rest.get('/user', (req, res, ctx) => {
        return res(
            ctx.status(403),
            ctx.json({
                errorMessage: 'Not authorized',
            }),
        )
    }),
]